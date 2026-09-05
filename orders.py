# backend/routes/orders.py - Checkout, Variant Stock Deduction & Gleam Points Rewards
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
from extensions import db
from models import User, Order, OrderItem, Product, ProductVariant, TrackingEvent
from utils.email import send_order_email
from utils.helpers import award_gleam_points

orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def generate_order_number():
    date_str = datetime.utcnow().strftime('%Y%m%d')
    random_hex = uuid.uuid4().hex[:6].upper()
    return f"AGG-{date_str}-{random_hex}"

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """
    Places an order, verifies variant-level inventory, decrements stock atomically,
    awards Gleam Points, and dispatches confirmation email.
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    data = request.get_json() or {}
    items_data = data.get('items', [])
    delivery_address = (data.get('delivery_address') or '').strip()
    payment_method = data.get('payment_method', 'M-Pesa')
    delivery_fee = float(data.get('delivery_fee', 150.0))
    discount = float(data.get('discount', 0.0))

    if not items_data:
        return jsonify({'error': 'Order must contain at least one item.'}), 400
    if not delivery_address:
        return jsonify({'error': 'Delivery address or Nairobi pickup point is required.'}), 400

    # 1. ATOMIC INVENTORY VALIDATION & VARIANT STOCK DEDUCTION
    order_items_to_create = []
    subtotal = 0.0

    for item in items_data:
        prod_id = item.get('product_id') or item.get('id')
        variant_id = item.get('variant_id')
        qty = int(item.get('quantity', 1))

        product = Product.query.get(prod_id)
        if not product or not product.is_active:
            return jsonify({'error': f"Product '{item.get('name', 'Item')}' is no longer available."}), 400

        variant = None
        variant_name = "Standard"
        unit_price = product.price

        if variant_id:
            variant = ProductVariant.query.filter_by(id=variant_id, product_id=product.id).first()
            if not variant:
                return jsonify({'error': f"Selected variant not found for '{product.name}'."}), 400
            
            # Check specific variant stock
            if variant.stock_quantity < qty:
                return jsonify({
                    'error': f"Variant '{variant.color} / {variant.size}' of '{product.name}' is out of stock (only {variant.stock_quantity} available)."
                }), 400

            unit_price += variant.price_adjustment
            variant_name = f"Color: {variant.color} | Size: {variant.size}"
            # Decrement Variant Stock
            variant.stock_quantity -= qty

        else:
            # Check general product stock if no variant chosen
            if product.stock < qty:
                return jsonify({
                    'error': f"Item '{product.name}' is out of stock (only {product.stock} available)."
                }), 400
            product.stock -= qty

        line_total = unit_price * qty
        subtotal += line_total

        order_items_to_create.append({
            'product_id': product.id,
            'variant_id': variant.id if variant else None,
            'product_name': product.name,
            'variant_info': variant_name,
            'price': unit_price,
            'quantity': qty,
            'total': line_total
        })

    total = max(0.0, subtotal + delivery_fee - discount)
    order_num = generate_order_number()

    # 2. CREATE ORDER & ORDER ITEMS
    order = Order(
        order_number=order_num,
        user_id=user.id,
        customer_name=user.name,
        customer_email=user.email,
        customer_phone=(data.get('phone') or user.phone or '').strip(),
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        discount=discount,
        total=total,
        payment_method=payment_method,
        payment_status="paid" if payment_method.lower() == 'cash' else "pending",
        delivery_address=delivery_address,
        delivery_notes=(data.get('delivery_notes') or '').strip(),
        status="pending"
    )
    db.session.add(order)
    db.session.flush()

    for oi in order_items_to_create:
        item_record = OrderItem(
            order_id=order.id,
            product_id=oi['product_id'],
            variant_id=oi['variant_id'],
            product_name=oi['product_name'],
            variant_info=oi['variant_info'],
            price=oi['price'],
            quantity=oi['quantity'],
            total=oi['total']
        )
        db.session.add(item_record)

    # 3. INITIALIZE FIRST TRACKING CHECKPOINT
    initial_event = TrackingEvent(
        order_id=order.id,
        location="Aesthetic Girly Gleam Hub (Kasarani, Nairobi)",
        status="Order Confirmed",
        description="We received your order and are packing your cute finds! ✨"
    )
    db.session.add(initial_event)

    # 4. AWARD GLEAM LOYALTY POINTS (10 points per KES 100 spent)
    points_earned = int((total // 100) * 10)
    if points_earned > 0:
        award_gleam_points(user.id, points_earned, f"Order #{order_num}")

    db.session.commit()

    # 5. TRIGGER EMAIL CONFIRMATION
    send_order_email(user.email, order_num, "pending", order.to_dict())

    return jsonify({
        'message': 'Order placed successfully! 🎉',
        'points_earned': points_earned,
        'order': order.to_dict()
    }), 201


@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    if user.is_admin or user.role == 'admin':
        orders = Order.query.order_by(Order.created_at.desc()).all()
    else:
        orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()

    return jsonify({'orders': [o.to_dict() for o in orders]}), 200


@orders_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    order = Order.query.filter((Order.id == order_id) | (Order.order_number == order_id)).first()

    if not order:
        return jsonify({'error': 'Order not found.'}), 404

    if order.user_id != user.id and not (user.is_admin or user.role == 'admin'):
        return jsonify({'error': 'Access denied.'}), 403

    return jsonify({'order': order.to_dict()}), 200


@orders_bp.route('/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_status(order_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not (user.is_admin or user.role == 'admin'):
        return jsonify({'error': 'Admin privileges required.'}), 403

    order = Order.query.filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        return jsonify({'error': 'Order not found.'}), 404

    data = request.get_json() or {}
    status = (data.get('status') or '').lower().strip()
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Choose from: {", ".join(valid_statuses)}'}), 400

    order.status = status
    if status == 'delivered':
        order.payment_status = 'paid'

    # Auto-add checkpoint on status change
    checkpoint = TrackingEvent(
        order_id=order.id,
        location=data.get('location', 'Nairobi Delivery Courier'),
        status=status.capitalize(),
        description=data.get('description', f"Order marked as {status}.")
    )
    db.session.add(checkpoint)
    db.session.commit()

    # Trigger email
    send_order_email(order.customer_email, order.order_number, status, order.to_dict())

    return jsonify({'message': f'Order status updated to {status}!', 'order': order.to_dict()}), 200
