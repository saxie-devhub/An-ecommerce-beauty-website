// public/admin.js - Complete Admin Portal Controller
const API_BASE = `${window.location.origin}/api`;

// ============================================
// 1. AUTHENTICATION & ADMIN ROLE VALIDATION
// ============================================

function checkAdminAuth() {
  try {
    const user =
      JSON.parse(localStorage.getItem('agg_user') || 'null') ||
      JSON.parse(localStorage.getItem('user') || 'null');

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    if (!user || !token) {
      localStorage.setItem('agg_redirect_after_login', '/admin.html');
      window.location.href = '/login.html?redirect=/admin.html';
      return null;
    }

    const isAdmin = Boolean(user.is_admin || user.role === 'admin' || user.email?.includes('admin'));
    if (!isAdmin) {
      alert('⚠️ Access Denied: Admin privileges required.');
      window.location.href = '/home.html';
      return null;
    }

    return { user, token };
  } catch (err) {
    console.error('Admin auth verification error:', err);
    window.location.href = '/login.html';
    return null;
  }
}

function getAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  return {
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...extraHeaders
  };
}

// Toast notification helper
function showToast(message, type = 'success') {
  let toast = document.getElementById('adminToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adminToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 14px 24px;
      border-radius: 12px;
      color: #fff;
      font-weight: 700;
      z-index: 99999;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
  }, 3500);
}

// ============================================
// 2. DASHBOARD OVERVIEW STATS
// ============================================

async function loadDashboardStats() {
  try {
    const [ordersRes, usersRes, reviewsRes] = await Promise.all([
      fetch(`${API_BASE}/orders`, { headers: getAuthHeaders(), credentials: 'include' }),
      fetch(`${API_BASE}/users`, { headers: getAuthHeaders(), credentials: 'include' }),
      fetch(`${API_BASE}/reviews`, { credentials: 'include' })
    ]);

    const ordersData = await ordersRes.json().catch(() => ({ orders: [] }));
    const usersData = await usersRes.json().catch(() => ({ users: [] }));
    const reviewsData = await reviewsRes.json().catch(() => ({ reviews: [] }));

    const orders = ordersData.orders || [];
    const users = usersData.users || [];
    const reviews = reviewsData.reviews || [];

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
        : '5.0';

    // DOM updates
    const revEl = document.getElementById('totalRevenue');
    const ordEl = document.getElementById('totalOrders');
    const custEl = document.getElementById('totalCustomers');
    const ratEl = document.getElementById('avgRating');

    if (revEl) revEl.textContent = `KES ${totalRevenue.toLocaleString()}`;
    if (ordEl) ordEl.textContent = orders.length;
    if (custEl) custEl.textContent = users.length;
    if (ratEl) ratEl.textContent = avgRating;

    renderRecentOrders(orders.slice(0, 5));
    renderRecentReviews(reviews.slice(0, 5));
  } catch (err) {
    console.error('Error loading dashboard stats:', err);
  }
}

function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrders');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<p style="color:#8b6f8a; font-size:0.9rem;">No orders yet.</p>';
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
      <div class="order-item" onclick="viewOrder('${order.id || order.order_number}')" style="cursor:pointer;">
        <div class="order-info">
          <h4>#${order.order_number || order.id}</h4>
          <p>${order.customer_name || 'Customer'} · ${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
        </div>
        <span class="order-status ${order.status}">${order.status}</span>
        <span class="order-total">KES ${Number(order.total || 0).toLocaleString()}</span>
      </div>`
    )
    .join('');
}

function renderRecentReviews(reviews) {
  const container = document.getElementById('recentReviews');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:#8b6f8a; font-size:0.9rem;">No reviews yet.</p>';
    return;
  }

  container.innerHTML = reviews
    .map(
      (r) => `
      <div class="review-item">
        <div>
          <div style="color:#f5a623;">${'★'.repeat(r.rating || 5)}</div>
          <p style="margin:4px 0 0; font-size:0.88rem; color:#4b174f;">${r.comment}</p>
          <small style="color:#8b6f8a;">— ${r.name || 'Anonymous'}</small>
        </div>
        <span style="font-size:0.75rem; color:#8b6f8a;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
      </div>`
    )
    .join('');
}

// ============================================
// 3. PRODUCT CATALOG & INVENTORY MANAGEMENT
// ============================================

let allProducts = [];

async function loadProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
    const data = await res.json();
    allProducts = data.products || [];

    renderProductsTable(allProducts);
  } catch (err) {
    console.error('Error fetching products:', err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#e74c3c;">Failed to load products.</td></tr>';
  }
}

function renderProductsTable(products) {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#8b6f8a;">No products found.</td></tr>';
    return;
  }

  tbody.innerHTML = products
    .map((p) => {
      const stock = Number(p.stock || 0);
      let stockClass = 'stock-in';
      let stockLabel = `${stock} in stock`;

      if (stock === 0) {
        stockClass = 'stock-out';
        stockLabel = 'Out of Stock (0)';
      } else if (stock <= 5) {
        stockClass = 'stock-low';
        stockLabel = `Low Stock (${stock})`;
      }

      return `
      <tr>
        <td><img src="${p.imageUrl || '/images/patch.jpeg'}" class="product-img-thumb" alt="${p.name}" onerror="this.src='/images/patch.jpeg'" /></td>
        <td><strong style="color:#4b174f;">${p.name}</strong><br><small style="color:#8b6f8a;">${p.description ? p.description.slice(0, 50) + '...' : ''}</small></td>
        <td><span style="background:#f5e8ff; color:#7e39b8; font-weight:600; padding:3px 10px; border-radius:99px; font-size:0.75rem;">${p.category || 'Accessories'}</span></td>
        <td><strong>KES ${Number(p.price || 0).toLocaleString()}</strong></td>
        <td><span class="stock-badge ${stockClass}">${stockLabel}</span></td>
        <td><span style="color:${p.isActive !== false ? '#27ae60' : '#e74c3c'}; font-weight:700;">${p.isActive !== false ? '● Active' : '● Inactive'}</span></td>
        <td>
          <button class="btn-action-sm btn-edit" onclick="editProduct('${p.id}')">✏️ Edit</button>
          <button class="btn-action-sm btn-delete" onclick="deleteProduct('${p.id}')">🗑️ Delete</button>
        </td>
      </tr>`;
    })
    .join('');
}

// Open modal for adding
document.getElementById('openAddProductModal')?.addEventListener('click', () => {
  document.getElementById('productForm').reset();
  document.getElementById('modalProductId').value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Product ✨';
  document.getElementById('productModal').classList.add('show');
});

// Edit product
window.editProduct = function (id) {
  const prod = allProducts.find((p) => String(p.id) === String(id));
  if (!prod) return;

  document.getElementById('modalProductId').value = prod.id;
  document.getElementById('modalProdName').value = prod.name || '';
  document.getElementById('modalProdPrice').value = prod.price || 0;
  document.getElementById('modalProdStock').value = prod.stock || 0;
  document.getElementById('modalProdCategory').value = prod.category || 'Accessories';
  document.getElementById('modalProdImage').value = prod.imageUrl || '';
  document.getElementById('modalProdDesc').value = prod.description || '';

  document.getElementById('productModalTitle').textContent = 'Edit Product Details';
  document.getElementById('productModal').classList.add('show');
};

// Delete product
window.deleteProduct = async function (id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (res.ok) {
      showToast('Product deleted successfully.');
      loadProducts();
    } else {
      showToast('Failed to delete product', 'error');
    }
  } catch (e) {
    showToast('Network error deleting product', 'error');
  }
};

// Save product (Add or Edit)
document.getElementById('productForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const id = document.getElementById('modalProductId').value;
  const name = document.getElementById('modalProdName').value.trim();
  const price = Number(document.getElementById('modalProdPrice').value);
  const stock = Number(document.getElementById('modalProdStock').value);
  const category = document.getElementById('modalProdCategory').value;
  const imageUrl = document.getElementById('modalProdImage').value.trim();
  const description = document.getElementById('modalProdDesc').value.trim();

  const payload = { name, price, stock, category, imageUrl, description };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;

  try {
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      showToast(id ? '✨ Product updated successfully!' : '✨ New product added!');
      document.getElementById('productModal').classList.remove('show');
      loadProducts();
    } else {
      showToast(data.error || 'Failed to save product', 'error');
    }
  } catch (err) {
    showToast('Network error saving product', 'error');
  }
});

// ============================================
// 4. ORDER MANAGEMENT & STATUS UPDATING
// ============================================

let allOrdersList = [];

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    allOrdersList = data.orders || [];
    renderOrders(allOrdersList);
  } catch (err) {
    console.error('Error loading orders:', err);
  }
}

function renderOrders(orders) {
  const container = document.getElementById('ordersList');
  if (!container) return;

  if (orders.length === 0) {
    container.innerHTML = '<p style="color:#8b6f8a; padding:24px 0;">No orders found.</p>';
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
      <div class="order-item" onclick="viewOrder('${order.id || order.order_number}')">
        <div class="order-info">
          <h4>#${order.order_number || order.id}</h4>
          <p>${order.customer_name || 'Customer'} · ${order.customer_email || ''} · ${order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
          <small style="color:#8b6f8a;">${order.items ? order.items.length : 0} items · ${order.delivery_address || 'Pickup'}</small>
        </div>
        <span class="order-status ${order.status}">${order.status}</span>
        <span class="order-total">KES ${Number(order.total || 0).toLocaleString()}</span>
      </div>`
    )
    .join('');
}

window.viewOrder = async function (orderId) {
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    const order = data.order || allOrdersList.find((o) => o.id === orderId || o.order_number === orderId);

    if (!order) {
      showToast('Order details not found', 'error');
      return;
    }

    showOrderModal(order);
  } catch (err) {
    showToast('Error opening order details', 'error');
  }
};

function showOrderModal(order) {
  const modal = document.getElementById('orderModal');
  const detail = document.getElementById('orderDetail');
  const items = order.items || [];

  detail.innerHTML = `
    <div class="order-detail-header" style="display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; color:#4b174f;">#${order.order_number || order.id}</h2>
      <span class="order-status ${order.status}">${order.status}</span>
    </div>

    <div class="order-detail-info" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
      <div><strong>Customer:</strong> ${order.customer_name || 'N/A'}</div>
      <div><strong>Email:</strong> ${order.customer_email || 'N/A'}</div>
      <div><strong>Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
      <div><strong>Payment:</strong> ${order.payment_method || 'M-Pesa'} (${order.payment_status || 'Paid'})</div>
      <div><strong>Delivery Address:</strong> ${order.delivery_address || 'N/A'}</div>
      <div><strong>Tracking #:</strong> ${order.tracking_number || 'N/A'}</div>
    </div>

    <h4 style="margin:16px 0 8px; color:#4b174f;">Ordered Items</h4>
    <table class="order-items-table" style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#fdf5fc; text-align:left;">
          <th style="padding:8px;">Item</th>
          <th style="padding:8px; text-align:center;">Qty</th>
          <th style="padding:8px; text-align:right;">Price</th>
          <th style="padding:8px; text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (i) => `
          <tr style="border-bottom:1px solid #f2e1f0;">
            <td style="padding:8px;">${i.name}</td>
            <td style="padding:8px; text-align:center;">${i.quantity || 1}</td>
            <td style="padding:8px; text-align:right;">KES ${Number(i.price || 0).toLocaleString()}</td>
            <td style="padding:8px; text-align:right; font-weight:700;">KES ${(
              (Number(i.price) || 0) * (Number(i.quantity) || 1)
            ).toLocaleString()}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>

    <div style="display:flex; justify-content:space-between; padding:12px 0; border-top:2px solid #ecd2e8; margin-top:12px; font-weight:800; font-size:1.1rem; color:#d5488c;">
      <span>Total Paid:</span>
      <span>KES ${Number(order.total || 0).toLocaleString()}</span>
    </div>

    <div class="order-actions" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:16px;">
      ${order.status !== 'processing' ? `<button class="btn-processing" onclick="updateOrderStatus('${order.id}', 'processing')">📦 Mark Processing</button>` : ''}
      ${order.status !== 'shipped' ? `<button class="btn-shipped" onclick="updateOrderStatus('${order.id}', 'shipped')">🚚 Mark Shipped (Email Customer)</button>` : ''}
      ${order.status !== 'delivered' ? `<button class="btn-delivered" onclick="updateOrderStatus('${order.id}', 'delivered')">✅ Mark Delivered (Email Customer)</button>` : ''}
      ${order.status !== 'cancelled' ? `<button class="btn-cancel" onclick="updateOrderStatus('${order.id}', 'cancelled')">❌ Cancel & Restore Stock</button>` : ''}
    </div>
  `;

  modal.classList.add('show');
}

window.updateOrderStatus = async function (orderId, status) {
  if (!confirm(`Update order status to "${status.toUpperCase()}"? An email will be sent automatically.`)) return;

  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(`✅ Status updated to ${status}. Email notification sent!`);
      document.getElementById('orderModal').classList.remove('show');
      loadOrders();
      loadDashboardStats();
    } else {
      showToast(data.error || 'Failed to update order status', 'error');
    }
  } catch (err) {
    showToast('Network error updating status', 'error');
  }
};

// ============================================
// 5. SALES REPORTS & CSV EXPORT
// ============================================

async function loadSalesReports() {
  try {
    const res = await fetch(`${API_BASE}/reports/sales`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    const summary = data.summary || {};
    const topProducts = data.topSellingProducts || [];

    const revEl = document.getElementById('reportRevenue');
    const avgEl = document.getElementById('reportAvgOrder');
    const compEl = document.getElementById('reportCompleted');
    const topListEl = document.getElementById('topProductsList');

    if (revEl) revEl.textContent = `KES ${Number(summary.totalRevenue || 0).toLocaleString()}`;
    if (avgEl) avgEl.textContent = `KES ${Number(summary.avgOrderValue || 0).toLocaleString()}`;
    if (compEl) compEl.textContent = summary.completedOrders || 0;

    if (topListEl) {
      if (topProducts.length === 0) {
        topListEl.innerHTML = '<p style="color:#8b6f8a;">No sales recorded yet.</p>';
      } else {
        topListEl.innerHTML = topProducts
          .map(
            (p, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#fdf5fc; border-radius:12px; margin-bottom:8px;">
              <div>
                <strong style="color:#4b174f;">#${idx + 1} ${p.name}</strong>
                <div style="color:#8b6f8a; font-size:0.82rem;">${p.quantitySold} units sold</div>
              </div>
              <strong style="color:#d5488c;">KES ${p.totalRevenue.toLocaleString()}</strong>
            </div>`
          )
          .join('');
      }
    }
  } catch (err) {
    console.error('Error loading sales reports:', err);
  }
}

// Export Sales CSV
document.getElementById('exportSalesCsvBtn')?.addEventListener('click', async function () {
  try {
    showToast('⏳ Generating Sales CSV...');
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');

    const res = await fetch(`${API_BASE}/reports/export-csv`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' },
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to generate CSV');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aesthetic_Girly_Gleam_Sales_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('✅ Sales CSV downloaded successfully!');
  } catch (err) {
    showToast('Failed to download CSV', 'error');
  }
});

// ============================================
// 6. CUSTOMERS & REVIEWS TAB LOADERS
// ============================================

async function loadCustomers() {
  const container = document.getElementById('customersList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const data = await res.json();
    const users = data.users || [];

    if (users.length === 0) {
      container.innerHTML = '<p style="color:#8b6f8a;">No customers found.</p>';
      return;
    }

    container.innerHTML = users
      .map(
        (u) => {
          const isAdmin = u.role === 'admin' || u.is_admin === 1;
          return `
        <div class="customer-item" style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#fdf5fc; border-radius:14px; margin-bottom:10px; border: 1px solid #f2dfee;">
          <div>
            <h4 style="margin:0; color:#4b174f;">
              ${u.name || 'Customer'} 
              <span style="font-size:0.75rem; background:${isAdmin ? '#7e39b8' : '#e8d4e6'}; color:${isAdmin ? '#fff' : '#4b174f'}; padding:2px 8px; border-radius:99px; text-transform:uppercase; font-weight:700;">
                ${isAdmin ? '👑 Admin' : 'Customer'}
              </span>
            </h4>
            <p style="margin:4px 0 0; color:#8b6f8a; font-size:0.85rem;">✉ ${u.email}</p>
          </div>
          <div style="text-align:right; display:flex; align-items:center; gap:12px;">
            <div>
              <div style="font-weight:600; color:#4b174f;">📱 ${u.phone || 'No phone'}</div>
              <small style="color:#8b6f8a;">Joined: ${new Date(u.created_at).toLocaleDateString()}</small>
            </div>
            <button 
              onclick="toggleUserAdminRole('${u.id}', '${isAdmin ? 'customer' : 'admin'}')"
              style="padding:6px 14px; border-radius:99px; border:0; font-size:0.78rem; font-weight:700; cursor:pointer; background:${isAdmin ? '#fce8e6' : '#e6f4ea'}; color:${isAdmin ? '#d93025' : '#137333'};">
              ${isAdmin ? 'Revoke Admin' : '👑 Make Admin'}
            </button>
          </div>
        </div>`;
        }
      )
      .join('');
  } catch (err) {
    console.error('Error loading customers:', err);
  }
}

window.toggleUserAdminRole = async function(userId, newRole) {
  if (!confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) return;

  try {
    const res = await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ role: newRole })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(`✨ User role updated to ${newRole.toUpperCase()}!`);
      loadCustomers();
    } else {
      showToast(data.error || 'Failed to update role', 'error');
    }
  } catch (err) {
    showToast('Network error updating role', 'error');
  }
};

async function loadReviews() {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/reviews`, { credentials: 'include' });
    const data = await res.json();
    const reviews = data.reviews || [];

    if (reviews.length === 0) {
      container.innerHTML = '<p style="color:#8b6f8a;">No reviews found.</p>';
      return;
    }

    container.innerHTML = reviews
      .map(
        (r) => `
        <div class="review-item" style="padding:16px; background:#fdf5fc; border-radius:14px; margin-bottom:10px;">
          <div style="color:#f5a623; font-size:1.1rem;">${'★'.repeat(r.rating || 5)}</div>
          <p style="margin:6px 0; color:#4b174f;">“${r.comment}”</p>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#8b6f8a;">
            <span><strong>${r.name || 'Anonymous'}</strong> · ${r.location || 'Kenya'}</span>
            <span>${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
          </div>
        </div>`
      )
      .join('');
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

// ============================================
// 7. TAB NAVIGATION & MODAL CONTROLS
// ============================================

document.querySelectorAll('.admin-nav a').forEach((link) => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    document.querySelectorAll('.admin-nav a').forEach((a) => a.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));

    this.classList.add('active');
    const tabId = this.dataset.tab;
    const tabEl = document.getElementById(tabId);
    if (tabEl) tabEl.classList.add('active');

    // Trigger tab specific loads
    if (tabId === 'dashboard') loadDashboardStats();
    if (tabId === 'products') loadProducts();
    if (tabId === 'orders') loadOrders();
    if (tabId === 'reports') loadSalesReports();
    if (tabId === 'customers') loadCustomers();
    if (tabId === 'reviews') loadReviews();
  });
});

// Modal close handlers
document.getElementById('closeProductModal')?.addEventListener('click', () => {
  document.getElementById('productModal').classList.remove('show');
});
document.getElementById('closeOrderModal')?.addEventListener('click', () => {
  document.getElementById('orderModal').classList.remove('show');
});

// Admin Logout
document.getElementById('adminLogout')?.addEventListener('click', function () {
  localStorage.removeItem('agg_user');
  localStorage.removeItem('user');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', function () {
  const auth = checkAdminAuth();
  if (!auth) return;

  loadDashboardStats();
  loadProducts();
});
