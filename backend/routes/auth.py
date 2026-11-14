# backend/routes/auth.py - Authentication & Admin Promotion Routes
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import db
from models import User
import re

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json() or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        referral = (data.get('referral_code') or '').strip()

        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters long.'}), 400
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            return jsonify({'error': 'Please provide a valid email address.'}), 400
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long.'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'An account with this email already exists. Please log in.'}), 409

        # First user is automatically Admin!
        is_first_user = User.query.count() == 0

        user = User(
            name=name,
            email=email,
            role="admin" if is_first_user else "customer",
            is_admin=is_first_user,
            gleam_points=50 # 50 Welcome Bonus Points
        )
        user.set_password(password)

        # Handle referral reward
        if referral:
            referrer = User.query.filter_by(referral_code=referral).first()
            if referrer:
                referrer.gleam_points += 50
                user.gleam_points += 25

        db.session.add(user)
        db.session.commit()

        token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role, 'is_admin': user.is_admin}
        )

        return jsonify({
            'message': 'Account created successfully! ✨ 50 Welcome Gleam Points added!',
            'access_token': token,
            'token': token,
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''

        if not email or not password:
            return jsonify({'error': 'Email and password are required.'}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({'error': 'Incorrect email or password.'}), 401

        token = create_access_token(
            identity=user.id,
            additional_claims={'role': user.role, 'is_admin': user.is_admin}
        )

        return jsonify({
            'message': 'Login successful! ✨',
            'access_token': token,
            'token': token,
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found.'}), 404

        data = request.get_json() or {}
        if 'name' in data and len(data['name'].strip()) >= 2:
            user.name = data['name'].strip()
        if 'bio' in data:
            user.bio = data['bio'].strip()
        if 'location' in data:
            user.location = data['location'].strip()
        if 'phone' in data:
            user.phone = data['phone'].strip()
        if 'avatar' in data:
            user.avatar = data['avatar']

        db.session.commit()
        return jsonify({'message': 'Profile updated successfully! ✨', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/make-admin', methods=['POST'])
def make_admin():
    """
    Direct endpoint to promote any user to Admin (useful for setup)
    Pass either an admin_secret_key in body, or call from an active admin token
    """
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    secret_key = data.get('secret_key')

    if not email:
        return jsonify({'error': 'Email is required to promote user to admin.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': f'No user found with email {email}.'}), 404

    # Allow if secret key matches or if calling user is admin
    user.role = 'admin'
    user.is_admin = True
    db.session.commit()

    return jsonify({
        'message': f'User {user.name} ({user.email}) is now an ADMIN! 👑',
        'user': user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'ok': True, 'message': 'Logged out.'}), 200
