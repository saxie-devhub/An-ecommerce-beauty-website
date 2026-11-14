# backend/routes/mpesa.py - Safaricom Lipa Na M-Pesa STK Push & Callback Routes
from flask import Blueprint, request, jsonify
from extensions import db
from models import Order, Payment
from utils.mpesa import initiate_stk_push, format_phone_number
from utils.email import send_order_email
from datetime import datetime

mpesa_bp = Blueprint('mpesa', __name__, url_prefix='/api/mpesa')

@mpesa_bp.route('/pay', methods=['POST'])
def mpesa_pay():
    """
    POST /api/mpesa/pay
    Initiates STK Push prompt on customer phone for an order
    Payload: { "order_id": "...", "phone_number": "07XXXXXXXX" }
    """
    try:
        data = request.get_json() or {}
        order_id = data.get('order_id')
        phone_number = data.get('phone_number')

        if not order_id or not phone_number:
            return jsonify({'error': 'Both order_id and phone_number are required.'}), 400

        order = Order.query.filter((Order.id == order_id) | (Order.order_number == order_id)).first()
        if not order:
            return jsonify({'error': 'Order not found.'}), 404

        if order.payment_status == 'paid':
            return jsonify({'error': 'This order has already been paid for.'}), 400

        formatted_phone = format_phone_number(phone_number)
        
        # Initiate STK Push via Daraja API helper
        stk_result = initiate_stk_push(
            phone_number=formatted_phone,
            amount=order.total,
            account_reference=order.order_number,
            transaction_desc="Aesthetic Girly Gleam"
        )

        if not stk_result.get('success'):
            return jsonify({'error': stk_result.get('error', 'Failed to initiate M-Pesa prompt.')}), 400

        checkout_id = stk_result.get('CheckoutRequestID')
        order.mpesa_checkout_request_id = checkout_id

        # Log payment record
        payment = Payment(
            order_id=order.id,
            checkout_request_id=checkout_id,
            merchant_request_id=stk_result.get('MerchantRequestID', ''),
            phone_number=formatted_phone,
            amount=order.total,
            status='pending',
            result_desc='STK Push Sent'
        )
        db.session.add(payment)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': stk_result.get('CustomerMessage', 'STK Prompt sent! Please enter your M-Pesa PIN on your phone.'),
            'checkout_request_id': checkout_id,
            'order_number': order.order_number,
            'amount': order.total
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@mpesa_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    """
    POST /api/mpesa/callback
    Webhook called by Safaricom Daraja API with transaction results
    """
    try:
        data = request.get_json() or {}
        body = data.get('Body', {}).get('stkCallback', {})
        
        checkout_id = body.get('CheckoutRequestID')
        result_code = body.get('ResultCode')
        result_desc = body.get('ResultDesc', '')

        print(f"\n📲 [M-PESA CALLBACK RECEIVED] CheckoutID: {checkout_id} | Code: {result_code} | Desc: {result_desc}")

        payment = Payment.query.filter_by(checkout_request_id=checkout_id).first()
        if not payment:
            # If simulated or direct, attempt lookup by order
            print(f"⚠️ Payment record not found for CheckoutRequestID: {checkout_id}")
            return jsonify({'ResultCode': 0, 'ResultDesc': 'Accepted'}), 200

        order = Order.query.get(payment.order_id)

        # ResultCode == 0 means SUCCESSFUL PAYMENT
        if result_code == 0:
            payment.status = 'success'
            payment.result_desc = result_desc

            # Extract M-Pesa Receipt Number from CallbackMetadata
            meta_items = body.get('CallbackMetadata', {}).get('Item', [])
            receipt_number = ""
            for item in meta_items:
                if item.get('Name') == 'MpesaReceiptNumber':
                    receipt_number = item.get('Value')
                    payment.receipt_number = receipt_number

            if order:
                order.payment_status = 'paid'
                order.status = 'processing'
                order.mpesa_receipt_number = receipt_number
                send_order_email(order.customer_email, order.order_number, 'processing', order.to_dict())

            print(f"✅ [M-PESA SUCCESS] Order #{order.order_number if order else ''} marked PAID! Receipt: {receipt_number}")

        else:
            payment.status = 'failed'
            payment.result_desc = result_desc
            if order:
                order.payment_status = 'failed'
            print(f"❌ [M-PESA FAILED] {result_desc}")

        db.session.commit()
        return jsonify({'ResultCode': 0, 'ResultDesc': 'Callback received successfully.'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"❌ Callback Error: {e}")
        return jsonify({'ResultCode': 0, 'ResultDesc': 'Error processed'}), 200


@mpesa_bp.route('/status/<checkout_id>', methods=['GET'])
def check_payment_status(checkout_id):
    """
    Polling endpoint for the frontend to check if customer has finished entering PIN
    """
    payment = Payment.query.filter_by(checkout_request_id=checkout_id).first()
    if not payment:
        return jsonify({'status': 'not_found'}), 404

    return jsonify({
        'status': payment.status, # 'pending', 'success', 'failed'
        'receipt_number': payment.receipt_number,
        'result_desc': payment.result_desc
    }), 200
