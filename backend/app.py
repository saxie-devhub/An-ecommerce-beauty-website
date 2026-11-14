from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, verify_jwt_in_request
from functools import wraps
from dotenv import load_dotenv
# Add this import
from services.mpesa_service import MpesaService
import requests
import base64
import os
import MySQLdb
import MySQLdb.cursors
import bcrypt
import json
from datetime import datetime
import uuid

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret')

CORS(app, 
     origins=['http://localhost:3001', 'http://localhost:3000', 'http://localhost:5500'],
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'Accept'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
jwt = JWTManager(app)

# ============================================
# DATABASE CONNECTION
# ============================================

def get_db():
    try:
        password = os.getenv('MYSQL_PASSWORD', '')
        conn = MySQLdb.connect(
            host='localhost',
            user='root',
            passwd=password,
            db='aesthetic_girly_gleam',
            cursorclass=MySQLdb.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f"❌ Database error: {e}")
        return None

# ============================================
# ✅ TEST ROUTES - ADD THIS
# ============================================

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'Backend is running!',
        'timestamp': datetime.now().isoformat()
    }), 200

@app.route('/api/test/db', methods=['GET'])
def test_db():
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = db.cursor()
        cursor.execute("SELECT 'Database connected!' as message")
        result = cursor.fetchone()
        db.close()
        return jsonify({'message': result['message'] if result else 'Connected'}), 200
    except Exception as e:
        db.close()
        return jsonify({'error': str(e)}), 500

# ============================================
# AUTH DECORATOR
# ============================================

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            db = get_db()
            if not db:
                return jsonify({'error': 'Database connection failed'}), 500
            cursor = db.cursor()
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            db.close()
            if not user:
                return jsonify({'error': 'User not found'}), 401
            request.user = user
            return f(*args, **kwargs)
        except Exception as e:
            print(f"Auth error: {e}")
            return jsonify({'error': 'Authentication required'}), 401
    return decorated

# ============================================
# AUTH ROUTES
# ============================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        if not data.get('name') or len(data['name']) < 2:
            return jsonify({'error': 'Name must be at least 2 characters'}), 400
        
        if not data.get('email') or '@' not in data['email']:
            return jsonify({'error': 'Valid email is required'}), 400
        
        if not data.get('password') or len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        db = get_db()
        if not db:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = db.cursor()
        
        cursor.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cursor.fetchone():
            db.close()
            return jsonify({'error': 'Email already registered'}), 409
        
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(data['password'].encode('utf-8'), salt)
        
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (data['name'], data['email'], hashed.decode('utf-8'))
        )
        db.commit()
        user_id = cursor.lastrowid
        db.close()
        
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'user': {
                'id': user_id,
                'name': data['name'],
                'email': data['email']
            },
            'access_token': access_token
        }), 201
        
    except Exception as e:
        print(f"❌ Signup error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        db = get_db()
        if not db:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
        user = cursor.fetchone()
        db.close()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        access_token = create_access_token(identity=user['id'])
        
        # ✅ MAKE SURE is_admin is included
        return jsonify({
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'is_admin': user.get('is_admin', 0)  # ← THIS IS IMPORTANT
            },
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': str(e)}), 500
# ============================================
# REVIEW ROUTES
# ============================================

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    try:
        db = get_db()
        if not db:
            return jsonify({'error': 'Database connection failed'}), 500
        cursor = db.cursor()
        cursor.execute("""
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.is_approved = 1
            ORDER BY r.created_at DESC
            LIMIT 50
        """)
        reviews = cursor.fetchall()
        db.close()
        return jsonify({'reviews': reviews or []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reviews', methods=['POST'])
@require_auth
def create_review():
    data = request.get_json()
    
    if not data.get('rating') or not 1 <= data['rating'] <= 5:
        return jsonify({'error': 'Rating must be 1-5'}), 400
    
    if not data.get('comment') or len(data['comment']) < 5:
        return jsonify({'error': 'Comment must be at least 5 characters'}), 400
    
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO reviews (user_id, rating, comment) VALUES (%s, %s, %s)",
        (request.user['id'], data['rating'], data['comment'])
    )
    db.commit()
    review_id = cursor.lastrowid
    db.close()
    
    return jsonify({
        'review': {'id': review_id, 'rating': data['rating'], 'comment': data['comment']}
    }), 201

# ============================================
# CONTACT ROUTES
# ============================================

@app.route('/api/contact', methods=['POST'])
def send_contact():
    data = request.get_json()
    
    if not data.get('name') or len(data['name']) < 2:
        return jsonify({'error': 'Name is required'}), 400
    
    if not data.get('email') or '@' not in data['email']:
        return jsonify({'error': 'Valid email is required'}), 400
    
    if not data.get('subject') or len(data['subject']) < 3:
        return jsonify({'error': 'Subject is required'}), 400
    
    if not data.get('message') or len(data['message']) < 10:
        return jsonify({'error': 'Message must be at least 10 characters'}), 400
    
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO contact_messages (name, email, subject, message) VALUES (%s, %s, %s, %s)",
        (data['name'], data['email'], data['subject'], data['message'])
    )
    db.commit()
    db.close()
    
    return jsonify({
        'message': 'Your message has been sent! We\'ll get back to you soon.'
    }), 201

# ============================================
# ORDER ROUTES
# ============================================

def generate_order_number():
    return f"AGG-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

@app.route('/api/orders', methods=['POST'])
@require_auth
def create_order():
    user_id = request.user['id']
    data = request.get_json()
    
    if not data.get('items') or not data.get('total'):
        return jsonify({'error': 'Items and total are required'}), 400
    
    if not data.get('delivery_address'):
        return jsonify({'error': 'Delivery address is required'}), 400
    
    order_number = generate_order_number()
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    
    cursor.execute("""
        INSERT INTO orders 
        (user_id, order_number, items, subtotal, delivery_fee, total, 
         payment_method, delivery_address, delivery_notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id,
        order_number,
        json.dumps(data['items']),
        data.get('subtotal', data['total']),
        data.get('delivery_fee', 0),
        data['total'],
        data.get('payment_method', 'mpesa'),
        data['delivery_address'],
        data.get('delivery_notes')
    ))
    db.commit()
    order_id = cursor.lastrowid
    db.close()
    
    return jsonify({
        'order': {
            'id': order_id,
            'order_number': order_number,
            'total': data['total'],
            'status': 'pending'
        }
    }), 201

@app.route('/api/orders', methods=['GET'])
@require_auth
def get_orders():
    user_id = request.user['id']
    is_admin = request.user.get('is_admin', False)
    
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    
    if is_admin:
        cursor.execute("""
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        """)
    else:
        cursor.execute("""
            SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC
        """, (user_id,))
    
    orders = cursor.fetchall()
    db.close()
    return jsonify({'orders': orders}), 200

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
@require_auth
def update_order_status(order_id):
    is_admin = request.user.get('is_admin', False)
    
    if not is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    data = request.get_json()
    if not data.get('status'):
        return jsonify({'error': 'Status is required'}), 400
    
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (data['status'], order_id))
    db.commit()
    db.close()
    
    return jsonify({'message': 'Order status updated'}), 200

@app.route('/api/users', methods=['GET'])
@require_auth
def get_users():
    is_admin = request.user.get('is_admin', False)
    
    if not is_admin:
        return jsonify({'error': 'Admin access required'}), 403
    
    db = get_db()
    if not db:
        return jsonify({'error': 'Database connection failed'}), 500
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC")
    users = cursor.fetchall()
    db.close()
    return jsonify({'users': users}), 200

# ============================================
# M-PESA ROUTES
# ============================================

@app.route('/api/mpesa/pay', methods=['POST'])
@require_auth
def mpesa_pay():
    """Initiate M-Pesa STK Push"""
    data = request.get_json()
    
    if not data.get('phone_number'):
        return jsonify({'error': 'Phone number is required'}), 400
    
    if not data.get('amount') or float(data['amount']) <= 0:
        return jsonify({'error': 'Valid amount is required'}), 400
    
    if not data.get('order_id'):
        return jsonify({'error': 'Order ID is required'}), 400
    
    # Get order
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM orders WHERE id = %s AND user_id = %s", 
                   (data['order_id'], request.user['id']))
    order = cursor.fetchone()
    db.close()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Initialize M-Pesa service
    mpesa = MpesaService()
    
    # Initiate STK Push
    result = mpesa.stk_push(
        phone_number=data['phone_number'],
        amount=float(data['amount']),
        account_reference=order['order_number'],
        transaction_desc=f"Payment for order {order['order_number']}"
    )
    
    # Check if we got a valid response
    if result and result.get('ResponseCode') == '0':
        # Save transaction
        db = get_db()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO mpesa_transactions 
            (order_id, merchant_request_id, checkout_request_id, amount, phone_number, status)
            VALUES (%s, %s, %s, %s, %s, 'pending')
        """, (
            order['id'],
            result.get('MerchantRequestID'),
            result.get('CheckoutRequestID'),
            data['amount'],
            data['phone_number']
        ))
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'message': 'STK Push sent. Please check your phone.',
            'checkout_request_id': result.get('CheckoutRequestID')
        }), 200
    else:
        error_msg = result.get('errorMessage', 'Payment initiation failed') if result else 'No response from M-Pesa'
        return jsonify({
            'success': False,
            'error': error_msg
        }), 400

@app.route('/api/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """M-Pesa callback URL"""
    data = request.get_json()
    print("📱 M-Pesa Callback received:", data)
    
    if data and data.get('Body', {}).get('stkCallback'):
        callback = data['Body']['stkCallback']
        
        result_code = callback.get('ResultCode')
        result_desc = callback.get('ResultDesc')
        checkout_request_id = callback.get('CheckoutRequestID')
        
        db = get_db()
        cursor = db.cursor()
        
        if result_code == 0:
            # Payment successful
            cursor.execute("""
                UPDATE mpesa_transactions 
                SET status = 'completed', result_code = %s, result_desc = %s
                WHERE checkout_request_id = %s
            """, (result_code, result_desc, checkout_request_id))
            db.commit()
            
            # Get transaction
            cursor.execute("SELECT * FROM mpesa_transactions WHERE checkout_request_id = %s", 
                          (checkout_request_id,))
            transaction = cursor.fetchone()
            
            if transaction and transaction['order_id']:
                cursor.execute("""
                    UPDATE orders 
                    SET payment_status = 'paid', status = 'processing' 
                    WHERE id = %s
                """, (transaction['order_id'],))
                db.commit()
                
                # Create delivery record
                cursor.execute("""
                    INSERT INTO deliveries (order_id, status) VALUES (%s, 'pending')
                """, (transaction['order_id'],))
                db.commit()
                
                print(f"✅ Order {transaction['order_id']} paid and processing")
        else:
            # Payment failed
            cursor.execute("""
                UPDATE mpesa_transactions 
                SET status = 'failed', result_code = %s, result_desc = %s
                WHERE checkout_request_id = %s
            """, (result_code, result_desc, checkout_request_id))
            db.commit()
            print(f"❌ Payment failed: {result_desc}")
        
        db.close()
    
    return jsonify({'ResultCode': 0, 'ResultDesc': 'Success'}), 200

@app.route('/api/mpesa/status/<checkout_request_id>', methods=['GET'])
def mpesa_status(checkout_request_id):
    """Query transaction status"""
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM mpesa_transactions WHERE checkout_request_id = %s", 
                   (checkout_request_id,))
    transaction = cursor.fetchone()
    db.close()
    
    if transaction:
        return jsonify({
            'status': transaction['status'],
            'transaction': transaction
        }), 200
    else:
        return jsonify({'error': 'Transaction not found'}), 404

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    print("=" * 50)
    print("🔍 Testing database connection...")
    print("=" * 50)
    
    db = get_db()
    if db:
        print("✅ Database connected successfully!")
        db.close()
    else:
        print("❌ Database connection failed!")
        print("\n📋 Troubleshooting:")
        print("1. Open XAMPP Control Panel")
        print("2. Make sure MySQL has a green 'Running' light")
        print("3. Check your .env file")
    
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)