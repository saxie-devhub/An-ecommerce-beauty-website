// signup.js - With redirect support
const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Signup page loaded');

    // ============================================
    // GET REDIRECT URL
    // ============================================
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect') || '/home.html';

    // ============================================
    // PASSWORD TOGGLE
    // ============================================
    const toggleBtn = document.getElementById('toggleSignupPassword');
    const passwordInput = document.getElementById('signupPassword');
    
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            this.textContent = isHidden ? '🙈' : '👁';
        });
    }

    // ============================================
    // CART COUNT
    // ============================================
    function updateCartCount() {
        try {
            const cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = count || '0';
        } catch {
            document.getElementById('cartCount').textContent = '0';
        }
    }
    updateCartCount();

    // ============================================
    // SIGNUP FORM
    // ============================================
    const form = document.getElementById('signupForm');
    const status = document.getElementById('authStatus');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirmPassword').value;
            const submitBtn = document.getElementById('signupSubmitBtn');
            
            if (!name || name.length < 2) {
                status.textContent = '⚠️ Please enter your full name.';
                status.className = 'auth-status error';
                return;
            }
            
            if (!email || !email.includes('@')) {
                status.textContent = '⚠️ Please enter a valid email address.';
                status.className = 'auth-status error';
                return;
            }
            
            if (!password || password.length < 8) {
                status.textContent = '⚠️ Password must be at least 8 characters.';
                status.className = 'auth-status error';
                return;
            }
            
            if (password !== confirm) {
                status.textContent = '⚠️ Passwords do not match.';
                status.className = 'auth-status error';
                return;
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Creating account...';
            status.textContent = '';
            status.className = 'auth-status';
            
            try {
                console.log('📝 Sending signup request to:', `${API_BASE}/auth/signup`);
                
                const response = await fetch(`${API_BASE}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                
                const data = await response.json();
                console.log('📥 Signup response:', data);
                
                if (!response.ok) {
                    status.textContent = data.error || '❌ Signup failed. Please try again.';
                    status.className = 'auth-status error';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Sign Up →';
                    return;
                }
                
                if (data.user) {
                    localStorage.setItem('agg_user', JSON.stringify(data.user));
                    localStorage.setItem('agg_profile', JSON.stringify({
                        name: data.user.name,
                        email: data.user.email,
                        bio: '✨ Small details, major sparkle ✨',
                        location: '',
                        phone: '',
                        profile_pic: '',
                        updated_at: new Date().toISOString()
                    }));
                    
                    if (data.access_token) {
                        localStorage.setItem('access_token', data.access_token);
                    }
                }
                
                status.textContent = `✅ Welcome, ${data.user?.name || 'girly'}!`;
                status.className = 'auth-status success';
                
                console.log('🔄 Redirecting to:', redirectTo);
                setTimeout(() => {
                    window.location.href = redirectTo;
                }, 1000);
                
            } catch (error) {
                console.error('❌ Signup error:', error);
                status.textContent = '❌ Could not connect to server. Please make sure the backend is running on port 5000.';
                status.className = 'auth-status error';
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Sign Up →';
            }
        });
    }
}); 
