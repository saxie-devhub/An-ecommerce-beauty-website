# backend/utils/email.py - Flask-Mail Email Notification Service
from flask_mail import Message
from extensions import mail
import os

DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', '"Aesthetic Girly Gleam" <glow@aestheticgirlygleam.co.ke>')

def send_order_email(user_email: str, order_id: str, status: str, order_details: dict = None):
    """
    Sends customized HTML email update to customer on order placement / status change
    """
    status_lower = status.lower()
    subject_map = {
        'pending': f"💖 Order #{order_id} Confirmed - Aesthetic Girly Gleam",
        'processing': f"📦 Order #{order_id} is Being Packed with Love ✨",
        'shipped': f"🚚 Order #{order_id} Has Been Shipped!",
        'delivered': f"🎉 Order #{order_id} Has Arrived! Enjoy your glow 💖",
        'cancelled': f"❌ Order #{order_id} Status: Cancelled"
    }

    subject = subject_map.get(status_lower, f"✨ Update on Order #{order_id}")
    
    total = order_details.get('total', 0) if order_details else 0
    items_html = ""
    if order_details and 'items' in order_details:
        items_html = "".join([
            f"<tr style='border-bottom:1px solid #f9e2f3;'>"
            f"<td style='padding:8px 0; color:#4b174f;'>{i.get('product_name') or i.get('name', 'Item')} ({i.get('variant_info', 'Standard')})</td>"
            f"<td style='padding:8px 0; text-align:center;'>x{i.get('quantity', 1)}</td>"
            f"<td style='padding:8px 0; text-align:right; color:#d5488c; font-weight:700;'>KES {float(i.get('price', 0)) * int(i.get('quantity', 1)):,.2f}</td>"
            f"</tr>"
            for i in order_details['items']
        ])

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Poppins', Helvetica, Arial, sans-serif; background-color: #fdf0f7; margin: 0; padding: 24px; }}
        .email-container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 36px; box-shadow: 0 10px 30px rgba(75,23,79,0.08); border: 2px solid #f9e2f3; }}
        .logo {{ font-size: 26px; font-weight: 800; color: #d5488c; text-align: center; }}
        .badge {{ display: inline-block; background: #fdf0f7; color: #7e39b8; padding: 6px 18px; border-radius: 99px; font-size: 13px; font-weight: 700; text-transform: uppercase; margin: 10px 0; }}
        h1 {{ color: #4b174f; font-size: 22px; }}
        p {{ color: #6a4e68; font-size: 14px; line-height: 1.6; }}
        .order-box {{ background: #faf4fb; border-radius: 16px; padding: 20px; margin: 20px 0; }}
        table {{ width: 100%; border-collapse: collapse; }}
        .footer {{ text-align: center; margin-top: 28px; font-size: 12px; color: #9e829d; }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="logo">✨ Aesthetic Girly Gleam ✨</div>
        <div style="text-align:center;"><span class="badge">{status.upper()}</span></div>
        <h1>Order #{order_id}</h1>
        <p>Hello Gorgeous,</p>
        <p>Your order status has been updated to: <strong style="color:#d5488c; text-transform:capitalize;">{status}</strong>.</p>
        
        {f'''
        <div class="order-box">
          <table>
            <thead>
              <tr style="border-bottom: 2px solid #ecd2e8; text-align: left; font-size: 12px; text-transform: uppercase; color: #8b6f8a;">
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              {items_html}
            </tbody>
          </table>
          <div style="margin-top:14px; text-align:right; font-weight:800; color:#d5488c; font-size:16px;">
            Total: KES {float(total):,.2f}
          </div>
        </div>
        ''' if items_html else ''}

        <p>Questions? Reach out anytime on WhatsApp: <strong>+254 728 091 300</strong>.</p>
        <div class="footer">
          © 2026 Aesthetic Girly Gleam · Kasarani, Nairobi · Small details, major sparkle.
        </div>
      </div>
    </body>
    </html>
    """

    try:
        msg = Message(
            subject=subject,
            recipients=[user_email],
            html=html_body,
            sender=DEFAULT_SENDER
        )
        mail.send(msg)
        print(f"📧 [Flask-Mail] Sent '{subject}' to {user_email}")
        return True
    except Exception as e:
        print(f"📬 [Mail Preview] To: {user_email} | Subject: {subject} | Error: {e}")
        return False
