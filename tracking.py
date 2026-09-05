# backend/routes/tracking.py - Advanced Delivery Tracking Checkpoints
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Order, TrackingEvent, User

tracking_bp = Blueprint('tracking', __name__, url_prefix='/api/orders')

@tracking_bp.route('/<order_id>/track', methods=['GET'])
def get_tracking_timeline(order_id):
    """
    Returns vertical timeline of all tracking checkpoints for an order
    """
    order = Order.query.filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        return jsonify({'error': 'Order not found.'}), 404

    events = TrackingEvent.query.filter_by(order_id=order.id).order_by(TrackingEvent.timestamp.desc()).all()

    return jsonify({
        'order_number': order.order_number,
        'tracking_number': order.tracking_number,
        'current_status': order.status,
        'delivery_address': order.delivery_address,
        'checkpoints': [e.to_dict() for e in events]
    }), 200


@tracking_bp.route('/<order_id>/track', methods=['POST'])
@jwt_required()
def add_tracking_checkpoint(order_id):
    """
    Allows Admin / Dispatch rider to add a new checkpoint to the timeline
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not (user.is_admin or user.role == 'admin'):
        return jsonify({'error': 'Admin privileges required.'}), 403

    order = Order.query.filter((Order.id == order_id) | (Order.order_number == order_id)).first()
    if not order:
        return jsonify({'error': 'Order not found.'}), 404

    data = request.get_json() or {}
    location = (data.get('location') or 'Nairobi Transit Hub').strip()
    status = (data.get('status') or 'In Transit').strip()
    description = (data.get('description') or 'Package moving to delivery address.').strip()

    event = TrackingEvent(
        order_id=order.id,
        location=location,
        status=status,
        description=description
    )
    db.session.add(event)
    db.session.commit()

    return jsonify({
        'message': 'Tracking checkpoint logged successfully! 🚚',
        'checkpoint': event.to_dict()
    }), 201
