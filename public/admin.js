
// admin.js - Complete Working Admin Dashboard
const API_BASE = `${window.location.origin}/api`;

console.log('✅ Admin JS loaded');

// ============================================
// DIRECT ADMIN CHECK - FIXED
// ============================================

(function checkAdmin() {
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
    
    console.log('🔍 Admin check:', { token: !!token, user: user });
    
    if (!token || !user) {
        console.log('❌ No token or user, redirecting to login');
        window.location.href = '/login.html?redirect=/admin.html';
        return;
    }
    
    // Check if admin from localStorage
    if (user.is_admin === 1 || localStorage.getItem('agg_is_admin') === 'true') {
        console.log('✅ Admin confirmed from localStorage');
        return;
    }
    
    // ✅ FIXED: Correct API URL (was 'aoi' instead of 'api')
    fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => {
        console.log('📥 Response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('📥 Admin check response:', data);
        if (data.user && data.user.is_admin === 1) {
            console.log('✅ Admin confirmed from backend');
            const updatedUser = { ...user, ...data.user };
            localStorage.setItem('agg_user', JSON.stringify(updatedUser));
            localStorage.setItem('agg_is_admin', 'true');
        } else {
            console.log('❌ Not admin, redirecting');
            alert('⚠️ Admin access required.');
            window.location.href = '/home.html';
        }
    })
    .catch(err => {
        console.error('❌ Admin check error:', err);
        // Try fallback
        if (localStorage.getItem('agg_is_admin') === 'true') {
            console.log('✅ Admin from fallback');
            return;
        }
        alert('⚠️ Could not verify admin status. Please try again.');
        window.location.href = '/home.html';
    });
})();

// ============================================
// TOAST NOTIFICATION
// ============================================

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
            font-weight: 600;
            z-index: 9999;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            max-width: 400px;
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
    }, 3000);
}

// ============================================
// LOAD DASHBOARD STATS
// ============================================

async function loadStats() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        console.log('❌ No token found');
        return;
    }
    
    try {
        console.log('📊 Loading stats...');
        
        // Get orders - ✅ FIXED URL
        const ordersRes = await fetch(`${API_BASE}/orders`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];
        console.log('📦 Orders loaded:', orders.length);
        
        // Get users - ✅ FIXED URL
        const usersRes = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const usersData = await usersRes.json();
        const customers = usersData.users || [];
        console.log('👤 Customers loaded:', customers.length);
        
        // Get reviews
        const reviewsRes = await fetch(`${API_BASE}/reviews`);
        const reviewsData = await reviewsRes.json();
        const reviews = reviewsData.reviews || [];
        console.log('⭐ Reviews loaded:', reviews.length);
        
        // Calculate stats
        const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
        const avgRating = reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;
        
        // Update DOM
        document.getElementById('totalRevenue').textContent = `KES ${totalRevenue.toLocaleString()}`;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('avgRating').textContent = avgRating;
        
        // Render tables
        renderOrders(orders);
        renderCustomers(customers);
        renderReviews(reviews);
        
    } catch (error) {
        console.error('❌ Error loading stats:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

// ============================================
// RENDER ORDERS
// ============================================

function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📦</span>
                <p>No orders yet.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    orders.forEach(order => {
        const statusClass = order.status || 'pending';
        html += `
            <tr>
                <td><strong>#${order.order_number || order.id}</strong></td>
                <td>${order.customer_name || 'Customer'}</td>
                <td>KES ${parseFloat(order.total || 0).toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${statusClass}</span></td>
                <td>${new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn view" onclick="updateOrderStatus(${order.id}, 'processing')">Process</button>
                    <button class="action-btn approve" onclick="updateOrderStatus(${order.id}, 'shipped')">Ship</button>
                    <button class="action-btn delete" onclick="updateOrderStatus(${order.id}, 'delivered')">Deliver</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ============================================
// RENDER CUSTOMERS
// ============================================

function renderCustomers(customers) {
    const container = document.getElementById('customersList');
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">👤</span>
                <p>No customers yet.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    customers.forEach(customer => {
        html += `
            <tr>
                <td><strong>${customer.name || 'N/A'}</strong></td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td>${new Date(customer.created_at).toLocaleDateString()}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ============================================
// RENDER REVIEWS
// ============================================

function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⭐</span>
                <p>No reviews yet.</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>User</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    reviews.forEach(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const isApproved = review.is_approved === 1;
        html += `
            <tr>
                <td><strong>${review.user_name || 'Anonymous'}</strong></td>
                <td style="color:#f5a623;">${stars}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${review.comment || ''}</td>
                <td>${new Date(review.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge ${isApproved ? 'delivered' : 'pending'}">${isApproved ? 'Approved' : 'Pending'}</span></td>
                <td>
                    ${!isApproved ? `<button class="action-btn approve" onclick="approveReview(${review.id})">Approve</button>` : ''}
                    <button class="action-btn delete" onclick="deleteReview(${review.id})">Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

// ============================================
// ORDER ACTIONS
// ============================================

async function updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('access_token');
    if (!confirm(`Update order #${orderId} to "${status}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || 'Failed to update status', 'error');
            return;
        }
        
        showToast(`✅ Order status updated to ${status}`);
        loadStats();
        
    } catch (error) {
        console.error('Error updating order:', error);
        showToast('Failed to update order status', 'error');
    }
}

// ============================================
// REVIEW ACTIONS
// ============================================

async function approveReview(reviewId) {
    const token = localStorage.getItem('access_token');
    if (!confirm('Approve this review?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}/approve`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!response.ok) {
            showToast('Failed to approve review', 'error');
            return;
        }
        
        showToast('✅ Review approved');
        loadStats();
        
    } catch (error) {
        console.error('Error approving review:', error);
        showToast('Failed to approve review', 'error');
    }
}

async function deleteReview(reviewId) {
    const token = localStorage.getItem('access_token');
    if (!confirm('Delete this review?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        if (!response.ok) {
            showToast('Failed to delete review', 'error');
            return;
        }
        
        showToast('🗑️ Review deleted');
        loadStats();
        
    } catch (error) {
        console.error('Error deleting review:', error);
        showToast('Failed to delete review', 'error');
    }
}

// ============================================
// TAB SWITCHING
// ============================================

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const tabId = this.dataset.tab;
        document.getElementById('tab-' + tabId).classList.add('active');
    });
});

// ============================================
// LOGOUT
// ============================================

document.getElementById('adminLogoutBtn')?.addEventListener('click', function() {
    localStorage.removeItem('agg_user');
    localStorage.removeItem('agg_profile');
    localStorage.removeItem('access_token');
    localStorage.removeItem('agg_is_admin');
    window.location.href = '/login.html';
});

// ============================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

window.updateOrderStatus = updateOrderStatus;
window.approveReview = approveReview;
window.deleteReview = deleteReview;

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, initializing admin...');
    // Check admin again after DOM load
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
    
    if (user && user.is_admin === 1) {
        loadStats();
    } else if (localStorage.getItem('agg_is_admin') === 'true') {
        loadStats();
    } else {
        console.log('❌ Not admin, redirecting');
        window.location.href = '/home.html';
    }
});

console.log('✅ Admin dashboard loaded');
