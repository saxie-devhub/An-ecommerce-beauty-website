// auth-status.js - PERMANENT FIX

(function() {
    function addLogoutButton() {
        const header = document.querySelector('.header-actions');
        if (!header) return;
        
        if (document.querySelector('.logout-button')) return;
        
        let user = null;
        try {
            user = JSON.parse(localStorage.getItem('agg_user') || 'null');
        } catch {
            user = null;
        }
        
        if (!user) return;
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'logout-button';
        button.textContent = 'Log Out';
        button.setAttribute('aria-label', 'Log out of your account');
        button.style.cssText = `
            height: 33px;
            padding: 0 14px;
            border: 1px solid #e8b8d4;
            border-radius: 999px;
            color: #7b286c;
            background: #fff;
            font-size: .72rem;
            font-weight: 800;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.3s;
        `;
        
        button.addEventListener('click', async function() {
            this.disabled = true;
            this.textContent = '⏳';
            
            try {
                await fetch('/api/auth/logout', { 
                    method: 'POST', 
                    credentials: 'same-origin' 
                });
            } catch {
                // Ignore
            }
            
            // Clear ALL localStorage
            localStorage.removeItem('agg_user');
            localStorage.removeItem('agg_profile');
            localStorage.removeItem('agg_reviews');
            localStorage.removeItem('agg_wishlist');
            localStorage.removeItem('agg_orders');
            localStorage.removeItem('agg-cart');
            
            // Force reload from server (no cache)
            window.location.href = '/login.html?nocache=' + Date.now();
        });
        
        header.appendChild(button);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addLogoutButton);
    } else {
        addLogoutButton();
    }
})();
// Show admin link in navigation
function showAdminLink() {
    try {
        const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
        if (user) {
            // Check if admin - you can fetch from backend
            fetch('/api/auth/me', {
                credentials: 'same-origin'
            })
            .then(res => res.json())
            .then(data => {
                if (data.user && data.user.is_admin) {
                    const adminLink = document.getElementById('adminNavLink');
                    if (adminLink) adminLink.style.display = 'inline-block';
                }
            })
            .catch(() => {
                // If backend not available, check localStorage flag
                if (localStorage.getItem('agg_is_admin') === 'true') {
                    const adminLink = document.getElementById('adminNavLink');
                    if (adminLink) adminLink.style.display = 'inline-block';
                }
            });
        }
    } catch {
        // ignore
    }
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAdminLink);
} else {
    showAdminLink();
}
