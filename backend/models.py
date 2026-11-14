# backend/models.py - Complete SQLAlchemy E-Commerce Models for Aesthetic Girly Gleam
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.String(255), default="✨ Small details, major sparkle ✨")
    location = db.Column(db.String(150), default="")
    phone = db.Column(db.String(30), default="")
    avatar = db.Column(db.String(255), default="")
    role = db.Column(db.String(20), default="customer") # 'admin' or 'customer'
    is_admin = db.Column(db.Boolean, default=False)
    
    # Customer Loyalty System (Gleam Points)
    gleam_points = db.Column(db.Integer, default=50) # 50 Welcome Points
    referral_code = db.Column(db.String(20), unique=True, default=lambda: f"GLOW-{uuid.uuid4().hex[:6].upper()}")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    orders = db.relationship('Order', backref='customer', lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship('Review', backref='author', lazy=True, cascade="all, delete-orphan")
    wishlist_items = db.relationship('Wishlist', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'bio': self.bio,
            'location': self.location,
            'phone': self.phone,
            'avatar': self.avatar,
            'role': self.role,
            'is_admin': self.is_admin or (self.role == 'admin'),
            'gleam_points': self.gleam_points,
            'referral_code': self.referral_code,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default="")
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Accessories")
    stock = db.Column(db.Integer, default=10) # Fallback aggregate stock
    image_url = db.Column(db.String(255), default="/images/patch.jpeg") # Primary banner image
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    variants = db.relationship('ProductVariant', backref='product', lazy=True, cascade="all, delete-orphan")
    media = db.relationship('ProductMedia', backref='product', lazy=True, cascade="all, delete-orphan", order_by="ProductMedia.display_order")
    reviews = db.relationship('Review', backref='product', lazy=True, cascade="all, delete-orphan")
    wishlisted_by = db.relationship('Wishlist', backref='product', lazy=True, cascade="all, delete-orphan")

    def total_stock(self):
        if self.variants:
            return sum(v.stock_quantity for v in self.variants)
        return self.stock

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'category': self.category,
            'stock': self.total_stock(),
            'image_url': self.image_url,
            'is_active': self.is_active,
            'variants': [v.to_dict() for v in self.variants],
            'media': [m.to_dict() for m in self.media],
            'rating': round(sum(r.rating for r in self.reviews) / len(self.reviews), 1) if self.reviews else 5.0,
            'review_count': len(self.reviews),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ProductVariant(db.Model):
    __tablename__ = 'product_variants'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    color = db.Column(db.String(50), nullable=False, default="Default") # e.g., 'Baby Pink', 'Lavender', 'Glitter Gold'
    size = db.Column(db.String(30), nullable=False, default="Standard")  # e.g., 'S', 'M', 'L', 'Standard'
    sku = db.Column(db.String(50), default="")
    stock_quantity = db.Column(db.Integer, default=10)
    price_adjustment = db.Column(db.Float, default=0.0) # E.g., +100 for premium edition

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'color': self.color,
            'size': self.size,
            'sku': self.sku,
            'stock_quantity': self.stock_quantity,
            'price_adjustment': self.price_adjustment,
            'in_stock': self.stock_quantity > 0,
            'is_low_stock': 0 < self.stock_quantity < 10
        }


class ProductMedia(db.Model):
    __tablename__ = 'product_media'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    media_type = db.Column(db.String(10), nullable=False, default="image") # 'image' or 'video'
    url = db.Column(db.String(300), nullable=False)
    thumbnail_url = db.Column(db.String(300), default="")
    is_thumbnail = db.Column(db.Boolean, default=False)
    display_order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'media_type': self.media_type,
            'url': self.url,
            'thumbnail_url': self.thumbnail_url or self.url,
            'is_thumbnail': self.is_thumbnail,
            'display_order': self.display_order
        }


class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    variant_id = db.Column(db.String(36), db.ForeignKey('product_variants.id'), nullable=True)
    quantity = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product')
    variant = db.relationship('ProductVariant')


class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    customer_phone = db.Column(db.String(30), default="")
    
    subtotal = db.Column(db.Float, nullable=False)
    delivery_fee = db.Column(db.Float, default=150.0)
    discount = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    
    payment_method = db.Column(db.String(30), default="M-Pesa") # 'M-Pesa', 'Card', 'Cash'
    payment_status = db.Column(db.String(20), default="pending") # 'pending', 'paid', 'failed'
    mpesa_checkout_request_id = db.Column(db.String(100), default="")
    mpesa_receipt_number = db.Column(db.String(50), default="")
    
    delivery_address = db.Column(db.String(255), nullable=False)
    delivery_notes = db.Column(db.String(255), default="")
    status = db.Column(db.String(20), default="pending") # 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
    tracking_number = db.Column(db.String(50), default=lambda: f"TRK-{uuid.uuid4().hex[:8].upper()}")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    tracking_events = db.relationship('TrackingEvent', backref='order', lazy=True, cascade="all, delete-orphan", order_by="TrackingEvent.timestamp.desc()")
    payment_records = db.relationship('Payment', backref='order', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'customer_name': self.customer_name,
            'customer_email': self.customer_email,
            'customer_phone': self.customer_phone,
            'subtotal': self.subtotal,
            'delivery_fee': self.delivery_fee,
            'discount': self.discount,
            'total': self.total,
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'mpesa_receipt_number': self.mpesa_receipt_number,
            'delivery_address': self.delivery_address,
            'delivery_notes': self.delivery_notes,
            'status': self.status,
            'tracking_number': self.tracking_number,
            'items': [item.to_dict() for item in self.items],
            'tracking_events': [e.to_dict() for e in self.tracking_events],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=True)
    variant_id = db.Column(db.String(36), db.ForeignKey('product_variants.id'), nullable=True)
    product_name = db.Column(db.String(150), nullable=False)
    variant_info = db.Column(db.String(100), default="Standard") # E.g., "Color: Baby Pink | Size: Standard"
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, default=1)
    total = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'variant_id': self.variant_id,
            'product_name': self.product_name,
            'name': self.product_name,
            'variant_info': self.variant_info,
            'price': self.price,
            'quantity': self.quantity,
            'total': self.total
        }


class TrackingEvent(db.Model):
    __tablename__ = 'tracking_events'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    location = db.Column(db.String(100), default="Nairobi Hub")
    status = db.Column(db.String(50), default="Order Received") # 'Order Packed', 'In Transit', 'Out for Delivery', 'Delivered'
    description = db.Column(db.String(255), default="")

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M'),
            'location': self.location,
            'status': self.status,
            'description': self.description
        }


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False, default=5)
    comment = db.Column(db.Text, nullable=False)
    photo_url = db.Column(db.String(255), default="") # Review image upload in static/uploads
    reviewer_name = db.Column(db.String(100), default="Gleam Girl")
    reviewer_location = db.Column(db.String(100), default="Nairobi, Kenya")
    is_verified = db.Column(db.Boolean, default=True)
    is_approved = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'name': self.reviewer_name,
            'user_name': self.reviewer_name,
            'location': self.reviewer_location,
            'rating': self.rating,
            'comment': self.comment,
            'photo_url': self.photo_url,
            'is_verified': self.is_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Wishlist(db.Model):
    __tablename__ = 'wishlists'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('products.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=True)
    checkout_request_id = db.Column(db.String(100), unique=True, index=True, nullable=False)
    merchant_request_id = db.Column(db.String(100), default="")
    receipt_number = db.Column(db.String(50), default="")
    phone_number = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pending") # 'pending', 'success', 'failed'
    result_desc = db.Column(db.String(255), default="")
    transaction_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'checkout_request_id': self.checkout_request_id,
            'receipt_number': self.receipt_number,
            'phone_number': self.phone_number,
            'amount': self.amount,
            'status': self.status,
            'result_desc': self.result_desc,
            'transaction_date': self.transaction_date.isoformat() if self.transaction_date else None
        }
