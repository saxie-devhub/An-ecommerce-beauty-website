# backend/routes/products.py - Product Management, Media Gallery & Variants
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import User, Product, ProductMedia, ProductVariant
from utils.helpers import save_uploaded_media

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

def is_admin_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return user and (user.is_admin or user.role == 'admin')

# ============================================
# 1. CATALOG ROUTES (Public)
# ============================================

@products_bp.route('', methods=['GET'])
def get_all_products():
    category = request.args.get('category')
    search = request.args.get('search')
    in_stock_only = request.args.get('in_stock') == 'true'

    query = Product.query.filter_by(is_active=True)

    if category and category != 'all':
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.order_by(Product.created_at.desc()).all()
    
    if in_stock_only:
        products = [p for p in products if p.total_stock() > 0]

    return jsonify({
        'success': True,
        'count': len(products),
        'products': [p.to_dict() for p in products]
    }), 200


@products_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404
    return jsonify({'product': product.to_dict()}), 200

# ============================================
# 2. PRODUCT CRUD (Admin)
# ============================================

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    if not is_admin_user():
        return jsonify({'error': 'Admin privileges required.'}), 403

    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    price = data.get('price')

    if not name or price is None:
        return jsonify({'error': 'Product name and price are required.'}), 400

    product = Product(
        name=name,
        price=float(price),
        description=(data.get('description') or '').strip(),
        category=(data.get('category') or 'Accessories').strip(),
        stock=int(data.get('stock') or 10),
        image_url=(data.get('image_url') or '/images/patch.jpeg').strip()
    )

    db.session.add(product)
    db.session.flush()

    # Add primary banner image to Media Gallery automatically
    primary_media = ProductMedia(
        product_id=product.id,
        media_type='image',
        url=product.image_url,
        is_thumbnail=True,
        display_order=0
    )
    db.session.add(primary_media)

    # Optional: create default standard variant
    default_variant = ProductVariant(
        product_id=product.id,
        color=data.get('color', 'Standard'),
        size=data.get('size', 'Standard'),
        stock_quantity=int(data.get('stock') or 10)
    )
    db.session.add(default_variant)
    db.session.commit()

    return jsonify({'message': 'Product created successfully! ✨', 'product': product.to_dict()}), 201


@products_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    if not is_admin_user():
        return jsonify({'error': 'Admin privileges required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    data = request.get_json() or {}
    if 'name' in data: product.name = data['name'].strip()
    if 'price' in data: product.price = float(data['price'])
    if 'description' in data: product.description = data['description'].strip()
    if 'category' in data: product.category = data['category'].strip()
    if 'stock' in data: product.stock = int(data['stock'])
    if 'image_url' in data: product.image_url = data['image_url'].strip()
    if 'is_active' in data: product.is_active = bool(data['is_active'])

    db.session.commit()
    return jsonify({'message': 'Product updated successfully! ✨', 'product': product.to_dict()}), 200


@products_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    if not is_admin_user():
        return jsonify({'error': 'Admin privileges required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully.'}), 200

# ============================================
# 3. ADVANCED PRODUCT MEDIA GALLERY (Images & Videos)
# ============================================

@products_bp.route('/<product_id>/media', methods=['POST'])
@jwt_required()
def add_product_media(product_id):
    """
    Allows admin to upload multiple images or link video URLs for interactive gallery
    Supports multipart form uploads OR JSON payloads
    """
    if not is_admin_user():
        return jsonify({'error': 'Admin privileges required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    created_media = []

    # 1. Handle multipart file uploads
    if 'files' in request.files:
        files = request.files.getlist('files')
        order_index = len(product.media)
        for f in files:
            if f.filename:
                is_video = f.filename.rsplit('.', 1)[1].lower() in ['mp4', 'mov', 'webm']
                url = save_uploaded_media(f, subfolder="products")
                media_item = ProductMedia(
                    product_id=product.id,
                    media_type='video' if is_video else 'image',
                    url=url,
                    is_thumbnail=(order_index == 0),
                    display_order=order_index
                )
                db.session.add(media_item)
                created_media.append(media_item)
                order_index += 1

    # 2. Handle JSON payload (e.g., video URL links, YouTube/Cloudinary)
    elif request.is_json:
        data = request.get_json() or {}
        items = data.get('media', [data])
        order_index = len(product.media)
        for item in items:
            url = item.get('url')
            if url:
                media_type = item.get('media_type', 'image' if not url.endswith(('.mp4', '.webm')) else 'video')
                media_item = ProductMedia(
                    product_id=product.id,
                    media_type=media_type,
                    url=url,
                    thumbnail_url=item.get('thumbnail_url', url),
                    is_thumbnail=bool(item.get('is_thumbnail', False)),
                    display_order=order_index
                )
                db.session.add(media_item)
                created_media.append(media_item)
                order_index += 1

    db.session.commit()
    return jsonify({
        'message': f'Added {len(created_media)} media asset(s) to product gallery! ✨',
        'media': [m.to_dict() for m in product.media]
    }), 201

# ============================================
# 4. PRODUCT VARIANTS (Color & Size Stock)
# ============================================

@products_bp.route('/<product_id>/variants', methods=['POST'])
@jwt_required()
def add_product_variant(product_id):
    """
    Adds a color/size variant with dedicated stock quantity
    """
    if not is_admin_user():
        return jsonify({'error': 'Admin privileges required.'}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found.'}), 404

    data = request.get_json() or {}
    color = (data.get('color') or 'Standard').strip()
    size = (data.get('size') or 'Standard').strip()
    stock = int(data.get('stock_quantity') or 10)
    adjustment = float(data.get('price_adjustment') or 0.0)

    variant = ProductVariant(
        product_id=product.id,
        color=color,
        size=size,
        sku=f"AGG-{product.id[:4].upper()}-{color[:3].upper()}-{size[:2].upper()}",
        stock_quantity=stock,
        price_adjustment=adjustment
    )
    db.session.add(variant)
    db.session.commit()

    return jsonify({
        'message': f"Variant '{color} / {size}' added with {stock} units in stock! ✨",
        'variant': variant.to_dict()
    }), 201
