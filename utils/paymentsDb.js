const fs = require('fs');
const path = require('path');
const { isPostgresEnabled, listRecords, mutateRecords } = require('./pgStore');

const DB_PATH = path.join(__dirname, '..', 'data', 'payments.json');

function readLocalPayments() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
  } catch (error) {
    if (error.code !== 'ENOENT') console.error('Unable to read payment records:', error);
    return [];
  }
}

function writeLocalPayments(payments) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(payments, null, 2));
}

async function createPayment(payment) {
  if (isPostgresEnabled()) return mutateRecords('payments', (payments) => { payments.unshift(payment); return payment; });
  const payments = readLocalPayments();
  payments.unshift(payment);
  writeLocalPayments(payments);
  return payment;
}

async function updatePayment(checkoutRequestId, updates) {
  const update = (payments) => {
    const index = payments.findIndex((payment) => payment.checkoutRequestId === checkoutRequestId);
    if (index < 0) return null;
    payments[index] = { ...payments[index], ...updates, updatedAt: new Date().toISOString() };
    return payments[index];
  };
  if (isPostgresEnabled()) return mutateRecords('payments', update);
  const payments = readLocalPayments();
  const result = update(payments);
  if (result) writeLocalPayments(payments);
  return result;
}

async function findPayment(checkoutRequestId) {
  const payments = isPostgresEnabled() ? await listRecords('payments') : readLocalPayments();
  return payments.find((payment) => payment.checkoutRequestId === checkoutRequestId) || null;
}

module.exports = { createPayment, updatePayment, findPayment };
