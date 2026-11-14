# backend/utils/mpesa.py - Safaricom Daraja M-Pesa STK Push Integration
import os
import base64
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Daraja API Credentials from .env
CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', 'your_consumer_key_here')
CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', 'your_consumer_secret_here')
SHORTCODE = os.getenv('MPESA_SHORTCODE', '174379') # Lipa na M-Pesa Online Shortcode (Sandbox Default: 174379)
PASSKEY = os.getenv('MPESA_PASSKEY', 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919') # Sandbox Passkey
CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL', 'https://aestheticgirlygleam.co.ke/api/mpesa/callback')
ENV = os.getenv('MPESA_ENV', 'sandbox') # 'sandbox' or 'production'

AUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" if ENV == 'sandbox' else "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
STK_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest" if ENV == 'sandbox' else "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

def format_phone_number(phone: str) -> str:
    """
    Sanitizes and formats Kenyan phone number to 2547XXXXXXXX or 2541XXXXXXXX
    """
    clean = str(phone).strip().replace('+', '').replace(' ', '').replace('-', '')
    if clean.startswith('0'):
        return f"254{clean[1:]}"
    elif clean.startswith('7') or clean.startswith('1'):
        return f"254{clean}"
    elif clean.startswith('254'):
        return clean
    return clean

def get_mpesa_access_token() -> str:
    """
    Generates OAuth Bearer token from Safaricom Daraja API
    """
    try:
        response = requests.get(AUTH_URL, auth=(CONSUMER_KEY, CONSUMER_SECRET), timeout=15)
        if response.status_code == 200:
            return response.json().get('access_token')
        print(f"❌ M-Pesa Token Error: {response.text}")
        return None
    except Exception as e:
        print(f"❌ M-Pesa Auth Exception: {e}")
        return None

def generate_mpesa_password(shortcode: str, passkey: str, timestamp: str) -> str:
    """
    Generates Base64 Encoded Password = Base64(Shortcode + Passkey + Timestamp)
    """
    data_to_encode = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(data_to_encode.encode('utf-8')).decode('utf-8')

def initiate_stk_push(phone_number: str, amount: float, account_reference: str, transaction_desc: str = "Aesthetic Girly Gleam Order"):
    """
    Initiates Lipa Na M-Pesa STK Push directly to customer's mobile phone
    """
    formatted_phone = format_phone_number(phone_number)
    int_amount = int(round(float(amount))) # M-Pesa requires integer amount

    # In development/sandbox without live credentials, provide simulated response
    if not CONSUMER_KEY or CONSUMER_KEY == 'your_consumer_key_here':
        print(f"\n📱 [M-PESA SIMULATION] STK Push sent to {formatted_phone} for KES {int_amount} (Ref: {account_reference})")
        import uuid
        simulated_checkout_id = f"ws_CO_{uuid.uuid4().hex[:12].upper()}"
        return {
            'success': True,
            'is_simulation': True,
            'CheckoutRequestID': simulated_checkout_id,
            'ResponseCode': '0',
            'CustomerMessage': f"Success. STK PIN Prompt sent to {formatted_phone}. Enter M-Pesa PIN to complete payment."
        }

    access_token = get_mpesa_access_token()
    if not access_token:
        return {'success': False, 'error': 'Could not obtain M-Pesa authorization token.'}

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = generate_mpesa_password(SHORTCODE, PASSKEY, timestamp)

    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int_amount,
        "PartyA": formatted_phone,
        "PartyB": SHORTCODE,
        "PhoneNumber": formatted_phone,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": str(account_reference)[:12],
        "TransactionDesc": str(transaction_desc)[:12]
    }

    try:
        response = requests.post(STK_URL, json=payload, headers=headers, timeout=20)
        res_data = response.json()
        print(f"📥 M-Pesa STK Response: {res_data}")

        if response.status_code == 200 and res_data.get('ResponseCode') == '0':
            return {
                'success': True,
                'CheckoutRequestID': res_data.get('CheckoutRequestID'),
                'MerchantRequestID': res_data.get('MerchantRequestID'),
                'CustomerMessage': res_data.get('CustomerMessage', 'Please check your phone and enter your M-Pesa PIN.')
            }
        else:
            return {
                'success': False,
                'error': res_data.get('errorMessage') or res_data.get('CustomerMessage') or 'STK Push failed.'
            }
    except Exception as e:
        print(f"❌ STK Push Exception: {e}")
        return {'success': False, 'error': str(e)}
