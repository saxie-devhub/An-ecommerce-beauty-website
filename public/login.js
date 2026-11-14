// public/login.js - Aesthetic Girly Gleam Login Handler
const API_BASE = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ Aesthetic Girly Gleam Login Initialized');

  // 1. Determine redirect destination
  const urlParams = new URLSearchParams(window.location.search);
  let redirectTo = urlParams.get('redirect') || localStorage.getItem('agg_redirect_after_login') || '/profile.html';

  if (redirectTo.includes('login.html') || redirectTo.includes('signup.html') || !redirectTo) {
    redirectTo = '/profile.html';
  }

  // 2. Toggle password visibility
  const toggleBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('loginPassword');

  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      this.textContent = isHidden ? '🙈' : '👁';
    });
  }

  // 3. Cart badge updater
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
      const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const badge = document.getElementById('cartCount');
      if (badge) badge.textContent = count || '0';
    } catch (err) {
      console.warn('Cart error:', err);
    }
  }
  updateCartCount();

  // 4. Login Submission
  const form = document.getElementById('loginForm');
  const status = document.getElementById('authStatus');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('loginEmail')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;

      if (!email || !email.includes('@')) {
        showStatus('⚠️ Please enter a valid email address.', 'error');
        return;
      }
      if (!password || password.length < 8) {
        showStatus('⚠️ Password must be at least 8 characters long.', 'error');
        return;
      }

      setLoading(true);

      try {
        console.log(`🔐 Attempting login for: ${email}`);

        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const errMsg = data.error || data.message || '❌ Invalid email or password.';
          showStatus(errMsg, 'error');
          setLoading(false);
          return;
        }

        // 5. Standardize LocalStorage Keys
        if (data.user) {
          localStorage.setItem('agg_user', JSON.stringify(data.user));
          localStorage.setItem('user', JSON.stringify(data.user));

          const userProfile = {
            id: data.user.id,
            name: data.user.name || '',
            email: data.user.email || '',
            bio: data.user.bio || '✨ Small details, major sparkle ✨',
            location: data.user.location || '',
            phone: data.user.phone || '',
            pic: data.user.avatar || '',
            role: data.user.role || (data.user.is_admin ? 'admin' : 'customer')
          };
          localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }

        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem('access_token', token);
          localStorage.setItem('token', token);
        }

        localStorage.removeItem('agg_redirect_after_login');
        showStatus(`✨ Welcome back, ${data.user?.name || 'Gleam Girl'}! Redirecting...`, 'success');

        setTimeout(() => {
          window.location.href = redirectTo;
        }, 600);
      } catch (networkError) {
        console.error('❌ Login network error:', networkError);
        showStatus('❌ Could not connect to the server. Please try again shortly.', 'error');
        setLoading(false);
      }
    });
  }

  function showStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = `auth-status ${type}`;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) submitBtn.classList.add('is-loading');
    else submitBtn.classList.remove('is-loading');
  }
});
// In the login function, after successful login:
// In login.js, after successful login
if (data.user) {
    localStorage.setItem('agg_user', JSON.stringify(data.user));
    
    // ✅ Save admin status
    if (data.user.is_admin === 1) {
        localStorage.setItem('agg_is_admin', 'true');
        console.log('✅ Admin user logged in');
    }
    
    if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
    }
}
