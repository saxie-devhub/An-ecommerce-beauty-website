const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'payments.json');

function readPayments() {
  try {
    if (!fs.existsSync(DB_PATH)) return [];
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
  } catch (error) {
    console.error('Unable to read payment records:', error);
    return [];
  }
}

function writePayments(payments) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(payments, null, 2));
}

function createPayment(payment) {
  const payments = readPayments();
  payments.unshift(payment);
  writePayments(payments);
  return payment;
}

function updatePayment(checkoutRequestId, updates) {
  const payments = readPayments();
  const index = payments.findIndex((item) => item.checkoutRequestId === checkoutRequestId);
  if (index < 0) return null;
  payments[index] = { ...payments[index], ...updates, updatedAt: new Date().toISOString() };
  writePayments(payments);
  return payments[index];
}

function findPayment(checkoutRequestId) {
  return readPayments().find((item) => item.checkoutRequestId === checkoutRequestId);
}

module.exports = { createPayment, updatePayment, findPayment };
