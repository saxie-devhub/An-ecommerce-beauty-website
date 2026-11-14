// routes/reports.js - Sales Reports & CSV Export API
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { readOrders } = require('../utils/ordersDb');

const router = express.Router();

/**
 * GET /api/reports/sales - (Admin Only) Aggregate sales statistics
 */
router.get('/sales', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await readOrders();

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    const validRevenueOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = validRevenueOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const avgOrderValue = validRevenueOrders.length > 0 ? (totalRevenue / validRevenueOrders.length).toFixed(2) : 0;

    // Top selling items
    const itemMap = {};
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      (o.items || []).forEach((item) => {
        const key = item.name || 'Product';
        if (!itemMap[key]) {
          itemMap[key] = { name: key, quantitySold: 0, totalRevenue: 0 };
        }
        itemMap[key].quantitySold += Number(item.quantity || 1);
        itemMap[key].totalRevenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
      });
    });

    const topSellingProducts = Object.values(itemMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return res.status(200).json({
      summary: {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        avgOrderValue: Number(avgOrderValue)
      },
      topSellingProducts,
      recentOrders: orders.slice(0, 10)
    });
  } catch (err) {
    console.error('Error generating sales report:', err);
    return res.status(500).json({ error: 'Failed to generate sales report.' });
  }
});

/**
 * GET /api/reports/export-csv - (Admin Only) Export sales data as CSV
 */
router.get('/export-csv', requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await readOrders();

    // CSV Header
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Items Purchased',
      'Subtotal (KES)',
      'Delivery Fee (KES)',
      'Total Amount (KES)',
      'Payment Method',
      'Payment Status',
      'Delivery Address',
      'Order Status'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    const rows = orders.map((o) => {
      const itemsStr = (o.items || [])
        .map((item) => `${item.name} (x${item.quantity || 1})`)
        .join('; ');

      const formattedDate = o.created_at
        ? new Date(o.created_at).toISOString().slice(0, 19).replace('T', ' ')
        : 'N/A';

      return [
        escapeCsv(o.order_number || o.id),
        escapeCsv(formattedDate),
        escapeCsv(o.customer_name || 'N/A'),
        escapeCsv(o.customer_email || 'N/A'),
        escapeCsv(o.customer_phone || 'N/A'),
        escapeCsv(itemsStr),
        escapeCsv(o.subtotal || 0),
        escapeCsv(o.delivery_fee || 0),
        escapeCsv(o.total || 0),
        escapeCsv(o.payment_method || 'M-Pesa'),
        escapeCsv(o.payment_status || 'Paid'),
        escapeCsv(o.delivery_address || 'N/A'),
        escapeCsv(o.status || 'pending')
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="aesthetic_girly_gleam_sales_${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('CSV Export Error:', err);
    return res.status(500).json({ error: 'Failed to export sales CSV.' });
  }
});

module.exports = router;
