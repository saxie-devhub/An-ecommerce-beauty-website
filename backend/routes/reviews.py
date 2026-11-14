# backend/routes/reviews.py - Customer Photo Reviews & Loyalty Points
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Review, User
from utils.helpers import save_uploaded_media, award_gleam_points

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['GET'])
def get_reviews():
    product_id = request.args.get('product_id')
    query = Review.query.filter_by(is_approved=True)

    if product_id:
        query = query.filter_by(product_id=product_id)

    reviews = query.order_by(Review.created_at.desc()).all()
    return jsonify({
        'success': True,
        'count': len(reviews),
        'reviews': [r.to_dict() for r in reviews]
    }), 200


@reviews_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_reviews():
    user_id = get_jwt_identity()
    reviews = Review.query.filter_by(user_id=user_id).order_by(Review.created_at.desc()).all()
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200


@reviews_bp.route('', methods=['POST'])
@jwt_required()
def post_review():
    """
    POST /api/reviews
    Accepts multipart/form-data for review text + customer photo upload
    Awards 20 Gleam Points to user for sharing feedback
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        # Read form values
        rating = int(request.form.get('rating', 5))
        comment = (request.form.get('comment') or '').strip()
        product_id = request.form.get('product_id')

        # Fallback to JSON if not multipart
        if not comment and request.is_json:
            data = request.get_json() or {}
            rating = int(data.get('rating', 5))
            comment = (data.get('comment') or '').strip()
            product_id = data.get('product_id')

        if rating < 1 or rating > 5:
            return jsonify({'error': 'Rating must be between 1 and 5 stars.'}), 400
        if len(comment) < 5:
            return jsonify({'error': 'Review comment must be at least 5 characters long.'}), 400

        # Handle Photo Upload if attached
        photo_url = ""
        if 'photo' in request.files:
            photo_file = request.files['photo']
            if photo_file and photo_file.filename:
                photo_url = save_uploaded_media(photo_file, subfolder="reviews")

        review = Review(
            user_id=user.id,
            product_id=product_id,
            rating=rating,
            comment=comment,
            photo_url=photo_url,
            reviewer_name=user.name,
            reviewer_location=user.location or "Nairobi, Kenya"
        )
        db.session.add(review)

        # Award 20 Gleam Points for posting a review
        award_gleam_points(user.id, 20, "Product Review Reward")

        db.session.commit()

        return jsonify({
            'message': 'Thank you for your glow review! ✨ +20 Gleam Points earned!',
            'review': review.to_dict(),
            'total_points': user.gleam_points
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
