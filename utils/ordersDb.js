// Order storage. DATABASE_URL enables PostgreSQL; without it, local JSON is used.
const fs = require('fs');
const path = require('path');
const { isPostgresEnabled, listRecords, mutateRecords } = require('./pgStore');

const DB_PATH = path.join(__dirname, '..', 'data', 'orders.json');

const DEFAULT_ORDERS = [
  {
    id: 'ord_101', order_number: 'AGG-20260828-A4F901', user_id: '32527c57-d47a-40a7-afff-dd410554ff57',
    customer_name: 'Mary Wambui', customer_email: 'saxiewambui@gmail.com', customer_phone: '+254 712 345 678',
    items: [
      { id: 'prod_1', name: 'Hydrocolloid Cute Heart & Star Pimple Patches', price: 350, quantity: 2 },
      { id: 'prod_5', name: 'Silky Velvet Oversized Hair Scrunchie', price: 250, quantity: 1 }
    ], subtotal: 950, delivery_fee: 150, total: 1100, payment_method: 'M-Pesa', payment_status: 'Paid',
    delivery_address: 'Kasarani, Clay City, Nairobi', delivery_status: 'delivered', status: 'delivered',
    tracking_number: 'TRK-AGG-9921', created_at: '2026-08-28T10:15:00.000Z'
  },
  {
    id: 'ord_102', order_number: 'AGG-20260830-B18C44', user_id: 'demo_user_faith',
    customer_name: 'Faith Achieng', customer_email: 'faith.achieng@gmail.com', customer_phone: '+254 798 765 432',
    items: [{ id: 'prod_2', name: 'Sparkle Quilted Baddie Shoulder Bag', price: 1800, quantity: 1 }],
    subtotal: 1800, delivery_fee: 200, total: 2000, payment_method: 'M-Pesa', payment_status: 'Paid',
    delivery_address: 'Westlands, Nairobi', delivery_status: 'in_transit', status: 'shipped',
    tracking_number: 'TRK-AGG-4812', created_at: '2026-08-30T14:30:00.000Z'
  }
];

function readLocalOrders() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeLocalOrders(DEFAULT_ORDERS);
      return DEFAULT_ORDERS;
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      writeLocalOrders(DEFAULT_ORDERS);
      return DEFAULT_ORDERS;
    }
    console.error('Unable to read orders:', error);
    return [];
  }
}

function writeLocalOrders(orders) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
}

async function readOrders() {
  return isPostgresEnabled() ? listRecords('orders') : readLocalOrders();
}

async function writeOrders(orders) {
  if (isPostgresEnabled()) return mutateRecords('orders', (records) => records.splice(0, records.length, ...orders));
  writeLocalOrders(orders);
}

async function findOrderById(id) {
  const orders = await readOrders();
  return orders.find((order) => String(order.id) === String(id) || order.order_number === String(id)) || null;
}

async function createOrder(order) {
  if (isPostgresEnabled()) return mutateRecords('orders', (orders) => { orders.unshift(order); return order; });
  const orders = readLocalOrders();
  orders.unshift(order);
  writeLocalOrders(orders);
  return order;
}

async function updateOrderStatus(id, status, extraFields = {}) {
  const update = (orders) => {
    const index = orders.findIndex((order) => String(order.id) === String(id) || order.order_number === String(id));
    if (index === -1) return null;
    orders[index] = { ...orders[index], status, ...extraFields, updated_at: new Date().toISOString() };
    return orders[index];
  };
  if (isPostgresEnabled()) return mutateRecords('orders', update);
  const orders = readLocalOrders();
  const result = update(orders);
  if (result) writeLocalOrders(orders);
  return result;
}

async function updateOrder(id, updates) {
  const update = (orders) => {
    const index = orders.findIndex((order) => String(order.id) === String(id) || order.order_number === String(id));
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...updates, updated_at: new Date().toISOString() };
    return orders[index];
  };
  if (isPostgresEnabled()) return mutateRecords('orders', update);
  const orders = readLocalOrders();
  const result = update(orders);
  if (result) writeLocalOrders(orders);
  return result;
}

module.exports = { DEFAULT_ORDERS, readOrders, writeOrders, findOrderById, createOrder, updateOrder, updateOrderStatus };
