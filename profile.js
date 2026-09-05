// public/profile.js - Aesthetic Girly Gleam Profile Manager
const API_BASE = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', async function () {
  console.log('✅ Profile Page Initialized');

  let storedUser = null;
  let storedProfile = null;
  let token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';

  try {
    storedUser =
      JSON.parse(localStorage.getItem('agg_user') || 'null') ||
      JSON.parse(localStorage.getItem('user') || 'null');

    storedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null') || {};
  } catch (err) {
    console.error('Error parsing localStorage:', err);
  }

  if (!storedUser) {
    localStorage.setItem('agg_redirect_after_login', '/profile.html');
    window.location.href = 'login.html?redirect=/profile.html';
    return;
  }

  populateUI(storedUser, storedProfile);

  // Sync profile with backend API
  async function syncProfileWithBackend() {
    try {
      const headers = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          storedUser = data.user;
          storedProfile = {
            ...storedProfile,
            name: data.user.name,
            email: data.user.email,
            bio: data.user.bio,
            location: data.user.location,
            phone: data.user.phone,
            pic: data.user.avatar || storedProfile.pic || ''
          };

          localStorage.setItem('agg_user', JSON.stringify(storedUser));
          localStorage.setItem('user', JSON.stringify(storedUser));
          localStorage.setItem('userProfile', JSON.stringify(storedProfile));

          populateUI(storedUser, storedProfile);
        }
      }
    } catch (netErr) {
      console.warn('Backend profile sync skipped, using cache:', netErr);
    }
  }

  function populateUI(user, profile) {
    try {
      const name = user.name || profile.name || 'Gleam Girl';
      const email = user.email || profile.email || 'user@email.com';
      const bio = profile.bio || user.bio || '✨ Small details, major sparkle ✨';
      const location = profile.location || user.location || '';
      const phone = profile.phone || user.phone || '';
      const avatar = profile.pic || user.avatar || '';

      document.getElementById('userName').textContent = name;
      document.getElementById('userEmail').textContent = email;
      document.getElementById('userBio').textContent = bio;

      document.getElementById('profileName').value = name;
      document.getElementById('profileBioInput').value = bio;
      document.getElementById('profileLocation').value = location;
      document.getElementById('profilePhone').value = phone;

      const isAdmin = Boolean(user.is_admin || user.role === 'admin');
      const adminBadge = document.getElementById('adminBadge');
      const adminNav = document.getElementById('adminNavLink');
      if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-block' : 'none';
      if (adminNav) adminNav.style.display = isAdmin ? 'inline-block' : 'none';

      const avatarImg = document.getElementById('profileAvatar');
      const avatarWrapper = document.getElementById('avatarWrapper');
      if (avatar && avatarImg && avatarWrapper) {
        avatarImg.src = avatar;
        avatarWrapper.classList.add('has-image');
      }
    } catch (err) {
      console.error('Error populating profile UI:', err);
    }
  }

  syncProfileWithBackend();

  // Photo Upload Handler
  const photoInput = document.getElementById('photoUpload');
  if (photoInput) {
    photoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async function (event) {
        const imgData = event.target.result;
        const avatarImg = document.getElementById('profileAvatar');
        const avatarWrapper = document.getElementById('avatarWrapper');

        if (avatarImg && avatarWrapper) {
          avatarImg.src = imgData;
          avatarWrapper.classList.add('has-image');
        }

        storedProfile.pic = imgData;
        localStorage.setItem('userProfile', JSON.stringify(storedProfile));

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify({ avatar: imgData })
        }).catch(() => {});

        showStatus('✨ Profile photo updated!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Profile Save Form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const name = document.getElementById('profileName').value.trim();
      const bio = document.getElementById('profileBioInput').value.trim();
      const location = document.getElementById('profileLocation').value.trim();
      const phone = document.getElementById('profilePhone').value.trim();

      const updatedProfile = { ...storedProfile, name, bio, location, phone };
      const updatedUser = { ...storedUser, name, bio, location, phone };

      localStorage.setItem('agg_user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      populateUI(updatedUser, updatedProfile);

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers,
          credentials: 'include',
          body: JSON.stringify({ name, bio, location, phone })
        });
        showStatus('✅ Profile saved successfully! ✨', 'success');
      } catch (err) {
        showStatus('✅ Saved locally.', 'success');
      }
    });
  }

  // Load User Orders & Reviews
  async function loadUserData() {
    const headers = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const ordersRes = await fetch(`${API_BASE}/orders`, { headers, credentials: 'include' });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        const orders = data.orders || [];
        renderOrders(orders);
        const orderBadge = document.getElementById('orderCount');
        if (orderBadge) orderBadge.textContent = orders.length;
      }
    } catch (e) {}

    try {
      const reviewsRes = await fetch(`${API_BASE}/reviews/my`, { headers, credentials: 'include' });
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        const reviews = data.reviews || [];
        renderReviews(reviews);
        const reviewBadge = document.getElementById('reviewCount');
        if (reviewBadge) reviewBadge.textContent = reviews.length;
      }
    } catch (e) {}
  }

  function renderOrders(orders) {
    const container = document.getElementById('myOrdersList');
    if (!container) return;
    if (orders.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">🛍️</span><p>No orders yet. <a href="index.html#shop" style="color:#d5488c; font-weight:600;">Shop now!</a></p></div>';
      return;
    }
    container.innerHTML = orders.map((o) => `
      <div class="my-order-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><strong>#${o.order_number || o.id}</strong> <span class="order-badge ${o.status || 'pending'}">${o.status}</span></div>
          <strong style="color:#d5488c;">KES ${Number(o.total || 0).toLocaleString()}</strong>
        </div>
        <p style="margin:6px 0; color:#6a4e68; font-size:0.9rem;">📍 Delivery: ${o.delivery_address || 'Pickup'}</p>
      </div>`).join('');
  }

  function renderReviews(reviews) {
    const container = document.getElementById('myReviewsList');
    if (!container) return;
    if (reviews.length === 0) {
      container.innerHTML = '<div class="empty-state"><span class="empty-icon">✍️</span><p>No reviews posted yet.</p></div>';
      return;
    }
    container.innerHTML = reviews.map((r) => `
      <div class="my-review-card">
        <div class="stars">${'★'.repeat(r.rating || 5)}</div>
        <p>“${r.comment}”</p>
      </div>`).join('');
  }

  loadUserData();

  // Logout Handler
  document.getElementById('logoutBtn')?.addEventListener('click', async function () {
    if (!confirm('Log out from Aesthetic Girly Gleam?')) return;
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('agg_user');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  function showStatus(msg, type) {
    const el = document.getElementById('profileStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = `profile-status ${type}`;
    setTimeout(() => { if (type === 'success') el.className = 'profile-status'; }, 3500);
  }
});
