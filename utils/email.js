// utils/email.js - Email Notification Service with Nodemailer
const nodemailer = require('nodemailer');

// Configure transporter
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback: development test logger
  return null;
}

const transporter = createTransporter();
const DEFAULT_FROM = process.env.EMAIL_FROM || '"Aesthetic Girly Gleam" <glow@aestheticgirlygleam.co.ke>';

/**
 * Send an Order Confirmation Email to customer
 */
async function sendOrderConfirmationEmail(order, customerEmail, customerName) {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0d5eb;">
        <td style="padding: 10px 0; color: #4b174f; font-weight: 500;">${item.name || 'Product'}</td>
        <td style="padding: 10px 0; text-align: center; color: #6a4e68;">x${item.quantity || 1}</td>
        <td style="padding: 10px 0; text-align: right; color: #d5488c; font-weight: 600;">KES ${(
          (item.price || 0) * (item.quantity || 1)
        ).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Helvetica, Arial, sans-serif; background-color: #fdf0f7; margin: 0; padding: 20px; color: #4b174f; }
        .email-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; box-shadow: 0 10px 30px rgba(75,23,79,0.08); border: 2px solid #f9e2f3; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 800; color: #d5488c; letter-spacing: -0.5px; }
        .badge { display: inline-block; background: #fdf0f7; color: #d5488c; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 700; margin-top: 8px; }
        h1 { color: #4b174f; font-size: 22px; margin: 16px 0 8px; }
        p { color: #6a4e68; font-size: 14px; line-height: 1.6; }
        .order-box { background: #faf4fb; border-radius: 16px; padding: 20px; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        .total-row { font-size: 16px; font-weight: 700; color: #4b174f; }
        .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #9e829d; }
      </style>
    </head>
    <body>
      <div class="email-card">
        <div class="header">
          <div class="logo">✨ Aesthetic Girly Gleam ✨</div>
          <div class="badge">Order Confirmed</div>
          <h1>Thank you for your order, ${customerName || 'Baddie'}! 💖</h1>
          <p>Your order <strong>#${order.order_number || order.id}</strong> has been received and is being prepared with love.</p>
        </div>

        <div class="order-box">
          <table>
            <thead>
              <tr style="border-bottom: 2px solid #ecd2e8; text-align: left; font-size: 12px; text-transform: uppercase; color: #8b6f8a;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 14px; font-weight: 700; color: #4b174f;">Total Paid:</td>
                <td style="padding-top: 14px; text-align: right; font-weight: 800; font-size: 18px; color: #d5488c;">KES ${Number(order.total || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p><strong>📍 Delivery Address:</strong> ${order.delivery_address || 'Pickup / Contact via WhatsApp'}</p>
        <p><strong>💳 Payment Method:</strong> ${order.payment_method || 'M-Pesa'}</p>

        <p style="margin-top: 20px;">Questions or want quick updates? Reach us on WhatsApp at <strong>+254 728 091 300</strong>.</p>

        <div class="footer">
          © 2026 Aesthetic Girly Gleam · Kasarani, Nairobi · Small details, major sparkle.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: customerEmail,
        subject: `💖 Order Confirmation #${order.order_number || order.id} - Aesthetic Girly Gleam`,
        html: htmlContent
      });
      console.log(`📧 Order confirmation email sent to ${customerEmail}`);
    } catch (err) {
      console.error(`❌ Failed to send email to ${customerEmail}:`, err.message);
    }
  } else {
    console.log(`\n📬 [EMAIL NOTIFICATION PREVIEW] To: ${customerEmail}`);
    console.log(`Subject: 💖 Order Confirmation #${order.order_number || order.id}`);
    console.log(`Total: KES ${order.total} | Items: ${(order.items || []).length}\n`);
  }
}

/**
 * Send Order Status Update Email to customer
 */
async function sendOrderStatusUpdateEmail(order, customerEmail, customerName, newStatus) {
  const statusEmoji = {
    processing: '📦',
    shipped: '🚚',
    delivered: '🎉',
    cancelled: '❌'
  }[newStatus.toLowerCase()] || '✨';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Poppins', Helvetica, Arial, sans-serif; background-color: #fdf0f7; margin: 0; padding: 20px; color: #4b174f; }
        .email-card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; box-shadow: 0 10px 30px rgba(75,23,79,0.08); border: 2px solid #f9e2f3; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 800; color: #d5488c; }
        .status-chip { display: inline-block; background: #fdf0f7; color: #7e39b8; padding: 8px 20px; border-radius: 99px; font-size: 14px; font-weight: 700; margin: 12px 0; text-transform: uppercase; border: 1px solid #f0d5eb; }
        h1 { color: #4b174f; font-size: 22px; margin: 12px 0; }
        p { color: #6a4e68; font-size: 14px; line-height: 1.6; }
        .footer { text-align: center; margin-top: 28px; font-size: 12px; color: #9e829d; }
      </style>
    </head>
    <body>
      <div class="email-card">
        <div class="header">
          <div class="logo">✨ Aesthetic Girly Gleam ✨</div>
          <div class="status-chip">${statusEmoji} Status: ${newStatus}</div>
          <h1>Update on Order #${order.order_number || order.id}</h1>
          <p>Hello ${customerName || 'Gleam Girl'},</p>
          <p>Your order status has been updated to: <strong style="color:#d5488c; text-transform: capitalize;">${newStatus}</strong>.</p>
        </div>

        ${
          order.tracking_number
            ? `<div style="background:#faf4fb; padding:16px; border-radius:12px; text-align:center; margin:16px 0;">
                 <p style="margin:0; font-size:13px; color:#8b6f8a;">Tracking Number</p>
                 <p style="margin:4px 0 0; font-size:16px; font-weight:700; color:#7e39b8;">${order.tracking_number}</p>
               </div>`
            : ''
        }

        <p>If you have any questions, reach out to our team anytime on WhatsApp at <strong>+254 728 091 300</strong>.</p>

        <div class="footer">
          © 2026 Aesthetic Girly Gleam · Kasarani, Nairobi · Small details, major sparkle.
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: DEFAULT_FROM,
        to: customerEmail,
        subject: `${statusEmoji} Order #${order.order_number || order.id} Status: ${newStatus.toUpperCase()}`,
        html: htmlContent
      });
      console.log(`📧 Status update email (${newStatus}) sent to ${customerEmail}`);
    } catch (err) {
      console.error(`❌ Failed to send status email to ${customerEmail}:`, err.message);
    }
  } else {
    console.log(`\n📬 [EMAIL NOTIFICATION PREVIEW] To: ${customerEmail}`);
    console.log(`Subject: ${statusEmoji} Order #${order.order_number || order.id} Status: ${newStatus.toUpperCase()}\n`);
  }
}

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
