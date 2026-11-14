import requests
import base64
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class MpesaService:
    def __init__(self):
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET')
        self.shortcode = os.getenv('MPESA_SHORTCODE', '174379')
        self.passkey = os.getenv('MPESA_PASSKEY', '')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL')
        self.environment = os.getenv('MPESA_ENV', 'sandbox')
        
        # Base URLs
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get OAuth access token"""
        auth_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        
        # Encode credentials
        credentials = f"{self.consumer_key}:{self.consumer_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {encoded_credentials}'
        }
        
        try:
            response = requests.get(auth_url, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get('access_token')
        except Exception as e:
            print(f"❌ Error getting access token: {e}")
            return None
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc="Payment"):
        """Initiate STK Push"""
        access_token = self.get_access_token()
        if not access_token:
            return {'error': 'Failed to get access token'}
        
        # Format phone number (remove leading 0 or +)
        phone_number = phone_number.replace('+', '').replace(' ', '')
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif not phone_number.startswith('254'):
            phone_number = '254' + phone_number
        
        # Generate timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Generate password
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()
        
        # STK Push URL
        stk_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        
        # Request payload
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'TransactionType': 'CustomerPayBillOnline',
            'Amount': int(amount),
            'PartyA': phone_number,
            'PartyB': self.shortcode,
            'PhoneNumber': phone_number,
            'CallBackURL': self.callback_url,
            'AccountReference': account_reference[:12],
            'TransactionDesc': transaction_desc[:20]
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(stk_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ STK Push error: {e}")
            return {'error': str(e)}
    
    def query_status(self, checkout_request_id):
        """Query STK Push status"""
        access_token = self.get_access_token()
        if not access_token:
            return {'error': 'Failed to get access token'}
        
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password_str = f"{self.shortcode}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()
        
        query_url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
        
        payload = {
            'BusinessShortCode': self.shortcode,
            'Password': password,
            'Timestamp': timestamp,
            'CheckoutRequestID': checkout_request_id
        }
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.post(query_url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"❌ Query error: {e}")
            return {'error': str(e)}