# backend/routes/admin.py - Admin Operations, Sales Reports CSV & Low Stock Alerts
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import io
import csv
from extensions import db
from models import User, Order, Product, ProductVariant, Review

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def is_admin():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and (user.is_admin or user.role == 'admin')

# ============================================
# 1. ADMIN DASHBOARD STATS & LOW STOCK ALERTS
# ============================================

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    if not is_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    orders = Order.query.all()
    valid_orders = [o for o in orders if o.status != 'cancelled']
    total_revenue = sum(o.total for o in valid_orders)

    total_customers = User.query.filter_by(role='customer').count()
    all_products = Product.query.filter_by(is_active=True).all()

    # Find Low Stock Items & Variants (stock < 10)
    low_stock_alerts = []
    for p in all_products:
        if p.variants:
            for v in p.variants:
                if v.stock_quantity < 10:
                    low_stock_alerts.append({
                        'product_id': p.id,
                        'product_name': p.name,
                        'variant_id': v.id,
                        'variant': f"{v.color} / {v.size}",
                        'stock': v.stock_quantity,
                        'status': 'Out of Stock' if v.stock_quantity == 0 else 'Low Stock'
                    })
        else:
            if p.stock < 10:
                low_stock_alerts.append({
                    'product_id': p.id,
                    'product_name': p.name,
                    'variant': 'Standard',
                    'stock': p.stock,
                    'status': 'Out of Stock' if p.stock == 0 else 'Low Stock'
                })

    avg_rating = 5.0
    reviews = Review.query.all()
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)

    return jsonify({
        'total_revenue': total_revenue,
        'total_orders': len(orders),
        'total_customers': total_customers,
        'avg_rating': avg_rating,
        'low_stock_count': len(low_stock_alerts),
        'low_stock_alerts': low_stock_alerts,
        'recent_orders': [o.to_dict() for o in orders[:5]]
    }), 200

# ============================================
# 2. SALES REPORTS & CSV EXPORT
# ============================================

@admin_bp.route('/reports/sales', methods=['GET'])
@jwt_required()
def get_sales_reports():
    if not is_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()
    valid_orders = [o for o in orders if o.status != 'cancelled']
    total_revenue = sum(o.total for o in valid_orders)
    avg_order = (total_revenue / len(valid_orders)) if valid_orders else 0.0

    return jsonify({
        'summary': {
            'total_revenue': total_revenue,
            'total_orders': len(orders),
            'delivered_orders': sum(1 for o in orders if o.status == 'delivered'),
            'pending_orders': sum(1 for o in orders if o.status in ['pending', 'processing']),
            'avg_order_value': round(avg_order, 2)
        },
        'orders': [o.to_dict() for o in orders]
    }), 200


@admin_bp.route('/reports/export-csv', methods=['GET'])
@jwt_required()
def export_sales_csv():
    """
    Generates and streams formatted CSV file with full sales transactions
    """
    if not is_admin():
        return jsonify({'error': 'Admin access required.'}), 403

    orders = Order.query.order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

    # CSV Header
    writer.writerow([
        'Order Number',
        'Date & Time',
        'Customer Name',
        'Customer Email',
        'Phone Number',
        'Items Purchased',
        'Subtotal (KES)',
        'Delivery Fee (KES)',
        'Total (KES)',
        'Payment Method',
        'Payment Status',
        'M-Pesa Receipt',
        'Delivery Address',
        'Order Status'
    ])

    for o in orders:
        items_desc = "; ".join([f"{i.product_name} [{i.variant_info}] x{i.quantity}" for i in o.items])
        writer.writerow([
            o.order_number,
            o.created_at.strftime('%Y-%m-%d %H:%M') if o.created_at else '',
            o.customer_name,
            o.customer_email,
            o.customer_phone,
            items_desc,
            f"{o.subtotal:.2f}",
            f"{o.delivery_fee:.2f}",
            f"{o.total:.2f}",
            o.payment_method,
            o.payment_status,
            o.mpesa_receipt_number or 'N/A',
            o.delivery_address,
            o.status
        ])

    csv_data = output.getvalue()
    filename = f"Aesthetic_Girly_Gleam_Sales_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8"
        }
    )
