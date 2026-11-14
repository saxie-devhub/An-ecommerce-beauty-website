const express = require('express');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { findOrderById, updateOrder } = require('../utils/ordersDb');
const { createPayment, findPayment, updatePayment } = require('../utils/paymentsDb');
const { restoreStock } = require('../utils/productsDb');

const router = express.Router();

function formatKenyanPhone(value) {
  const phone = String(value || '').replace(/[\s+-]/g, '');
  const normalized = phone.startsWith('0') ? `254${phone.slice(1)}` : phone.startsWith('7') || phone.startsWith('1') ? `254${phone}` : phone;
  return /^254[17]\d{8}$/.test(normalized) ? normalized : null;
}

function mpesaConfig() {
  const environment = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
  const baseUrl = environment === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  return {
    baseUrl,
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL
  };
}

async function requestStkPush({ phone, amount, reference }) {
  const config = mpesaConfig();
  if (!config.consumerKey || !config.consumerSecret || !config.shortcode || !config.passkey || !config.callbackUrl) {
    const error = new Error('M-Pesa is not configured. Add Daraja credentials and MPESA_CALLBACK_URL on the server.');
    error.statusCode = 503;
    throw error;
  }

  async function callDaraja(url, options, step) {
    try {
      return await fetch(url, options);
    } catch (cause) {
      const error = new Error(`Could not connect to Safaricom Daraja during ${step}. Check this computer's internet connection and confirm MPESA_ENV is set to the correct environment.`);
      error.statusCode = 502;
      error.cause = cause;
      throw error;
    }
  }

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
  const tokenResponse = await callDaraja(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` }
  }, 'authorization');
  const tokenData = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenData.access_token) {
    const error = new Error('M-Pesa authorization failed. Check the Daraja consumer key and secret.');
    error.statusCode = 502;
    throw error;
  }

  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString('base64');
  const response = await callDaraja(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.max(1, Math.round(Number(amount))),
      PartyA: phone,
      PartyB: config.shortcode,
      PhoneNumber: phone,
      CallBackURL: config.callbackUrl,
      AccountReference: String(reference).slice(0, 12),
      TransactionDesc: 'AGG Order'
    })
  }, 'STK Push');
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ResponseCode !== '0' || !data.CheckoutRequestID) {
    const error = new Error(data.errorMessage || data.CustomerMessage || 'M-Pesa could not send the STK prompt.');
    error.statusCode = 502;
    throw error;
  }
  return data;
}

router.post('/pay', requireAuth, async (req, res) => {
  let order;
  try {
    const { order_id: orderId, phone_number: phoneNumber } = req.body || {};
    const phone = formatKenyanPhone(phoneNumber);
    if (!orderId || !phone) return res.status(400).json({ error: 'Provide an order ID and a valid Kenyan Safaricom number.' });
    order = findOrderById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.user_id !== req.user.sub && req.user.role !== 'admin' && !req.user.isAdmin) return res.status(403).json({ error: 'You cannot pay for this order.' });
    if (String(order.payment_status).toLowerCase() === 'paid') return res.status(400).json({ error: 'This order is already paid.' });

    const stk = await requestStkPush({ phone, amount: order.total, reference: order.order_number || order.id });
    createPayment({ id: crypto.randomUUID(), orderId: order.id, checkoutRequestId: stk.CheckoutRequestID, merchantRequestId: stk.MerchantRequestID || '', phone, amount: order.total, status: 'pending', createdAt: new Date().toISOString() });
    updateOrder(order.id, { payment_status: 'pending', mpesa_checkout_request_id: stk.CheckoutRequestID, customer_phone: phone });
    return res.json({ success: true, checkout_request_id: stk.CheckoutRequestID, message: stk.CustomerMessage || 'STK prompt sent. Complete payment on your phone.' });
  } catch (error) {
    // The order endpoint reserves stock before payment starts. If an STK prompt cannot
    // be created, release that reservation so an unavailable payment service cannot
    // make products appear sold out.
    if (order && String(order.payment_status).toLowerCase() === 'pending' && !order.mpesa_checkout_request_id) {
      restoreStock(order.items || []);
      updateOrder(order.id, { payment_status: 'failed', status: 'cancelled' });
    }
    console.error('M-Pesa STK request failed:', error.message, error.cause?.cause?.code || error.cause?.code || '');
    return res.status(error.statusCode || 500).json({ error: error.message || 'Unable to start M-Pesa payment.' });
  }
});

router.post('/callback', (req, res) => {
  const callback = req.body?.Body?.stkCallback;
  const checkoutRequestId = callback?.CheckoutRequestID;
  const payment = checkoutRequestId && findPayment(checkoutRequestId);
  if (!payment) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

  const successful = Number(callback.ResultCode) === 0;
  const metadata = callback.CallbackMetadata?.Item || [];
  const receipt = metadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value || '';
  updatePayment(checkoutRequestId, { status: successful ? 'success' : 'failed', receiptNumber: receipt, resultDesc: callback.ResultDesc || '' });
  // A declined payment must release inventory. Guard against duplicate callbacks.
  if (!successful && payment.status === 'pending') {
    const failedOrder = findOrderById(payment.orderId);
    if (failedOrder) restoreStock(failedOrder.items || []);
  }
  updateOrder(payment.orderId, { payment_status: successful ? 'paid' : 'failed', status: successful ? 'processing' : 'pending', mpesa_receipt_number: receipt });
  return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

router.get('/status/:checkoutRequestId', requireAuth, (req, res) => {
  const payment = findPayment(req.params.checkoutRequestId);
  if (!payment) return res.status(404).json({ error: 'Payment not found.' });
  const order = findOrderById(payment.orderId);
  if (order?.user_id !== req.user.sub && req.user.role !== 'admin' && !req.user.isAdmin) return res.status(403).json({ error: 'Access denied.' });
  return res.json({ status: payment.status, receipt_number: payment.receiptNumber || '', result_desc: payment.resultDesc || '' });
});

module.exports = router;
