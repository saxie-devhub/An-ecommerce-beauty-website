// auth-status.js - Complete with admin link (NO active class)

(function() {
    console.log('🔐 auth-status.js loaded');

    // ============================================
    // SHOW ADMIN LINK ON ALL PAGES (NO ACTIVE CLASS)
    // ============================================
    function showAdminLink() {
        try {
            const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
            const isAdminFlag = localStorage.getItem('agg_is_admin') === 'true';
            
            // Check if user is admin
            if (user && (user.is_admin === 1 || isAdminFlag)) {
                console.log('✅ Admin detected - showing admin link');
                
                // Show admin link in main navigation - NO active class
                const adminLink = document.getElementById('adminNavLink');
                if (adminLink) {
                    adminLink.style.display = 'inline-block';
                    // ✅ REMOVE any active class
                    adminLink.classList.remove('active');
                    // Style it like a normal link
                    adminLink.style.background = 'transparent';
                    adminLink.style.color = '#5c4767';
                    adminLink.style.borderRadius = '99px';
                    adminLink.style.padding = '8px 16px';
                }
                
                // Show admin link in shop actions
                const adminShopLink = document.getElementById('adminShopLink');
                if (adminShopLink) {
                    adminShopLink.style.display = 'inline-block';
                }
            } else {
                console.log('❌ Not admin - hiding admin link');
            }
        } catch (error) {
            console.error('Error showing admin link:', error);
        }
    }

    // ============================================
    // ADD LOGOUT BUTTON
    // ============================================
    function addLogoutButton() {
        const header = document.querySelector('.header-actions');
        if (!header) return;
        if (document.querySelector('.logout-button')) return;
        
        const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
        if (!user) return;
        
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'logout-button';
        button.textContent = 'Log Out';
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
                await fetch(`${window.location.origin}/api/auth/logout`, { 
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
            } catch {
                // ignore
            }
            
            localStorage.removeItem('agg_user');
            localStorage.removeItem('agg_profile');
            localStorage.removeItem('agg_reviews');
            localStorage.removeItem('agg_wishlist');
            localStorage.removeItem('agg_orders');
            localStorage.removeItem('agg-cart');
            localStorage.removeItem('access_token');
            localStorage.removeItem('agg_is_admin');
            
            window.location.href = '/login.html?nocache=' + Date.now();
        });
        
        header.appendChild(button);
    }

    // ============================================
    // RUN ON PAGE LOAD
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM loaded, checking admin status...');
            showAdminLink();
            addLogoutButton();
        });
    } else {
        console.log('📄 Page already loaded, checking admin status...');
        showAdminLink();
        addLogoutButton();
    }
})();
