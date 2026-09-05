# backend/routes/wishlist.py - Customer Product Wishlist
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Wishlist, Product, User

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/wishlist')

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    items = Wishlist.query.filter_by(user_id=user_id).order_by(Wishlist.created_at.desc()).all()
    return jsonify({'wishlist': [item.to_dict() for item in items]}), 200


@wishlist_bp.route('/<product_id>', methods=['POST'])
@jwt_required()
def toggle_wishlist(product_id):
    """
    Toggles heart on a product (adds if not present, removes if already in wishlist)
    """
    user_id = get_jwt_identity()
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    existing = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': f"Removed '{product.name}' from your wishlist.", 'is_wishlisted': False}), 200
    else:
        new_item = Wishlist(user_id=user_id, product_id=product_id)
        db.session.add(new_item)
        db.session.commit()
        return jsonify({'message': f"Added '{product.name}' to your wishlist! 💖", 'is_wishlisted': True}), 201
