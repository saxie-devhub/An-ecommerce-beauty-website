// routes/orders.js - Order Management & Inventory Integration
const express = require('express');
const crypto = require('crypto');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  readOrders,
  findOrderById,
  createOrder,
  updateOrderStatus
} = require('../utils/ordersDb');
const { verifyAndDeductStock, restoreStock } = require('../utils/productsDb');
const {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
} = require('../utils/email');
const { sanitizeHtml } = require('../middleware/security');

const router = express.Router();

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `AGG-${dateStr}-${randomHex}`;
}

/**
 * POST /api/orders - (Protected) Place a new order with Inventory Stock Check
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const {
      items,
      delivery_fee = 150,
      payment_method = 'M-Pesa',
      delivery_address,
      delivery_notes,
      phone,
      delivery_name
    } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    if (!delivery_address || typeof delivery_address !== 'string' || delivery_address.trim().length < 3) {
      return res.status(400).json({ error: 'Please provide a valid delivery address or pickup point.' });
    }

    const fee = Number(delivery_fee);
    if (!Number.isFinite(fee) || fee < 0 || fee > 5000) {
      return res.status(400).json({ error: 'Delivery fee must be between KES 0 and KES 5,000.' });
    }

    // 1. Check inventory and deduct stock using current catalog prices.
    let orderItems;
    try {
      orderItems = verifyAndDeductStock(items);
    } catch (stockErr) {
      return res.status(stockErr.statusCode || 400).json({
        error: stockErr.message || 'One or more items in your cart are currently out of stock.'
      });
    }

    const calculatedSubtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    // The total is always calculated on the server; never trust a browser-supplied price.
    const finalTotal = calculatedSubtotal + fee;
    const orderNumber = generateOrderNumber();

    const newOrder = {
      id: `ord_${crypto.randomUUID()}`,
      order_number: orderNumber,
      user_id: userId,
      customer_name: delivery_name && delivery_name.trim().length >= 2
        ? sanitizeHtml(delivery_name.trim())
        : req.user.name || 'Gleam Girl',
      customer_email: req.user.email,
      customer_phone: phone ? sanitizeHtml(phone.trim()) : req.user.phone || '',
      items: orderItems,
      subtotal: calculatedSubtotal,
      delivery_fee: fee,
      total: finalTotal,
      payment_method: sanitizeHtml(payment_method),
      payment_status: 'pending',
      delivery_address: sanitizeHtml(delivery_address.trim()),
      delivery_notes: delivery_notes ? sanitizeHtml(delivery_notes.trim()) : '',
      delivery_status: 'pending',
      status: 'pending',
      tracking_number: `TRK-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      created_at: new Date().toISOString()
    };

    createOrder(newOrder);

    // 2. Send Order Confirmation Email asynchronously
    sendOrderConfirmationEmail(newOrder, newOrder.customer_email, newOrder.customer_name).catch((err) => {
      console.error('Email send failure:', err);
    });

    return res.status(201).json({
      message: 'Order placed successfully! 🎉',
      order: newOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to place order.' });
  }
});

/**
 * GET /api/orders - (Protected) Get customer's orders or all orders if Admin
 */
router.get('/', requireAuth, (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    const allOrders = readOrders();

    if (isAdmin) {
      return res.status(200).json({ orders: allOrders });
    }

    const userOrders = allOrders.filter(
      (o) => o.user_id === userId || (o.customer_email && o.customer_email.toLowerCase() === (req.user.email || '').toLowerCase())
    );

    return res.status(200).json({ orders: userOrders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to retrieve orders.' });
  }
});

/**
 * GET /api/orders/:id - (Protected) Get specific order detail
 */
router.get('/:id', requireAuth, (req, res) => {
  try {
    const order = findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const userId = req.user.sub || req.user.id;
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';

    if (order.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve order.' });
  }
});

/**
 * PUT /api/orders/:id/status - (Admin Only) Update order status & send email update
 */
router.put('/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, tracking_number } = req.body || {};

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid status. Choose from: ${validStatuses.join(', ')}`
      });
    }

    const existingOrder = findOrderById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const extra = {};
    if (tracking_number) extra.tracking_number = tracking_number;
    if (status.toLowerCase() === 'shipped') extra.delivery_status = 'in_transit';
    if (status.toLowerCase() === 'delivered') extra.delivery_status = 'delivered';

    // If cancelled, restore inventory
    if (status.toLowerCase() === 'cancelled' && existingOrder.status !== 'cancelled') {
      restoreStock(existingOrder.items || []);
    }

    const updated = updateOrderStatus(orderId, status.toLowerCase(), extra);

    // Trigger status update email
    if (updated.customer_email) {
      sendOrderStatusUpdateEmail(
        updated,
        updated.customer_email,
        updated.customer_name,
        updated.status
      ).catch((err) => console.error('Status email failed:', err));
    }

    return res.status(200).json({
      message: `Order #${updated.order_number || updated.id} status updated to ${updated.status}.`,
      order: updated
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status.' });
  }
});

module.exports = router;
