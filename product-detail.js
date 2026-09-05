// product-detail.js - Complete Working with All Products

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Product detail page loaded');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Product not found');
        return;
    }
    
    // ============================================
    // COMPLETE PRODUCT DATABASE (FIXED)
    // ============================================
    
    const allProducts = [
        { 
            id: 1, 
            name: 'Pimple Patches (Heart & Star)', 
            price: 150, 
            displayPrice: '@KES 150', 
            category: 'Skincare',
            image: 'patch.jpeg',
            emoji: '💖', 
            color: '#e937a8',
            colors: ['Pink', 'Clear', 'Yellow', 'Black', 'Purple', 'Green', 'Blue'],
            colorStock: { 'Pink': 5, 'Clear': 6, 'Yellow': 5, 'Black': 6, 'Purple': 6, 'Green': 12, 'Blue': 5 },
            stock: 39,
            rating: 4.8,
            reviews: 24,
            description: 'Ultra-cute tea tree and salicylic acid infused hydrocolloid patches for glowing skin. Perfect for overnight use.'
        },
        { 
            id: 2, 
            name: 'Pimple Patches (Stars)', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Skincare',
            image: 'patch.jpeg',
            emoji: '⭐', 
            color: '#f8d5eb',
            colors: ['Clear', 'Yellow', 'Purple', 'Green', 'Blue'],
            colorStock: { 'Clear': 5, 'Yellow': 2, 'Purple': 5, 'Green': 6, 'Blue': 2 },
            stock: 20,
            rating: 4.6,
            reviews: 18,
            description: 'Cute star-shaped hydrocolloid patches for glowing skin. Infused with tea tree oil and salicylic acid.'
        },
        { 
            id: 3, 
            name: 'Hair Bows', 
            price: 150, 
            displayPrice: '@KES 150', 
            category: 'Hair Accessories', 
            image: 'hairbow.jpeg', 
            emoji: '🎀', 
            color: '#ecd9f4',
            colors: ['Pink', 'Red', 'Black', 'White'],
            colorStock: { 'Pink': 0, 'Red': 1, 'Black': 1, 'White': 1 },
            stock: 3,
            rating: 4.7,
            reviews: 15,
            description: 'Beautiful satin hair bows for any occasion. Perfect for adding a cute touch to any hairstyle.'
        },
        { 
            id: 4, 
            name: 'Hair Clips', 
            price: 70, 
            displayPrice: 'From @KES 70', 
            category: 'Hair Accessories', 
            image: 'hairclip.jpeg', 
            emoji: '✨', 
            color: '#f7d8e7',
            colors: ['Black', 'Silver', 'Gold'],
            colorStock: { 'Black': 10, 'Silver': 5, 'Gold': 5 },
            stock: 20,
            rating: 4.4,
            reviews: 22,
            description: 'Cute resin hair clips in various colors. Perfect for everyday wear.'
        },
        { 
            id: 5, 
            name: 'Edge Brush', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Hair Accessories', 
            image: 'edgebrush.jpeg', 
            emoji: '🪮', 
            color: '#e2d7fa',
            colors: ['Black', 'Pink', 'Purple', 'Green'],
            colorStock: { 'Black': 1, 'Pink': 5, 'Purple': 1, 'Green': 4 },
            stock: 7,
            rating: 4.9,
            reviews: 30,
            description: 'Perfect edge control brush for sleek styles. Gentle on edges and gives a smooth finish.'
        },
        { 
            id: 6, 
            name: 'Satin Scrunchies', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Hair Accessories', 
            image: 'scrunchie.jpeg', 
            emoji: '🩷', 
            color: '#f4d2df',
            colors: ['Pink', 'Red', 'Black', 'White', 'Purple'],
            colorStock: { 'Pink': 5, 'Red': 5, 'Black': 5, 'White': 5, 'Purple': 5 },
            stock: 25,
            rating: 4.5,
            reviews: 28,
            description: 'Soft satin scrunchies that don\'t damage hair. Gentle on your strands while keeping your style in place.'
        },
        { 
            id: 7, 
            name: 'Necklaces', 
            price: 100, 
            displayPrice: 'From @KES 100', 
            category: 'Jewelry', 
            image: 'necklace.jpeg', 
            emoji: '📿', 
            color: '#eee2be',
            colors: ['Gold', 'Silver', 'Rose Gold'],
            colorStock: { 'Gold': 1, 'Silver': 10, 'Rose Gold': 10 },
            stock: 15,
            rating: 4.3,
            reviews: 12,
            description: 'Elegant necklaces for every outfit. Perfect for layering or wearing alone.'
        },
        { 
            id: 8, 
            name: 'Anklets', 
            price: 50, 
            displayPrice: 'From @KES 50', 
            category: 'Jewelry', 
            image: 'anklet.jpeg', 
            emoji: '💫', 
            color: '#e7ddf8',
            colors: ['Gold', 'Silver', 'Rose Gold'],
            colorStock: { 'Gold': 10, 'Silver': 10, 'Rose Gold': 5 },
            stock: 30,
            rating: 4.2,
            reviews: 10,
            description: 'Shimmering anklets to add sparkle to your steps. Adjustable for the perfect fit.'
        },
        { 
            id: 9, 
            name: 'Earrings', 
            price: 20, 
            displayPrice: 'From @KES 20', 
            category: 'Jewelry', 
            image: 'earrings.jpeg', 
            emoji: '🌸', 
            color: '#f8ddea',
            colors: ['Gold', 'Silver', 'Rose Gold', 'White', 'Black'],
            colorStock: { 'Gold': 10, 'Silver': 10, 'Rose Gold': 5, 'White': 5, 'Black': 5 },
            stock: 30,
            rating: 4.6,
            reviews: 20,
            description: 'Stylish earrings for everyday wear. Hypoallergenic and lightweight.'
        },
        { 
            id: 10, 
            name: 'Statement Earrings', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Jewelry', 
            image: 'statement-earrings.jpeg', 
            emoji: '✿', 
            color: '#f4d5f1',
            colors: ['Gold', 'Silver'],
            colorStock: { 'Gold': 10, 'Silver': 0 },
            stock: 10,
            rating: 4.7,
            reviews: 16,
            description: 'Bold statement earrings that turn heads. Perfect for parties and special occasions.'
        },
        { 
            id: 11, 
            name: 'Nose Ring', 
            price: 150, 
            displayPrice: '@KES 150', 
            category: 'Jewelry', 
            image: 'nosering.jpeg', 
            emoji: '◌', 
            color: '#e7dcba',
            colors: ['Gold', 'Silver', 'Rose Gold'],
            colorStock: { 'Gold': 3, 'Silver': 2, 'Rose Gold': 0 },
            stock: 5,
            rating: 4.8,
            reviews: 14,
            description: 'Stainless steel clip on designer nose rings. Comfortable and stylish for everyday wear.'
        },
        { 
            id: 12, 
            name: 'Septum Ring', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Jewelry', 
            image: 'septum.jpeg', 
            emoji: '◍', 
            color: '#efd9ee',
            colors: ['Gold', 'Silver', 'Black'],
            colorStock: { 'Gold': 0, 'Silver': 5, 'Black': 0 },
            stock: 10,
            rating: 4.4,
            reviews: 8,
            description: 'Stylish stainless steel septum rings. Hypoallergenic and easy to wear.'
        },
        { 
            id: 13, 
            name: 'Eyelash Clusters', 
            price: 200, 
            displayPrice: 'From @KES 200', 
            category: 'Lashes', 
            image: 'clusters.jpeg', 
            emoji: '◡', 
            color: '#eadff2',
            colors: ['Black'],
            colorStock: { 'Black': 10 },
            stock: 10,
            rating: 4.9,
            reviews: 35,
            description: 'Fluffy salon-quality DIY lash clusters. Easy to apply and gives a natural look.'
        },
        { 
            id: 14, 
            name: 'Strip Lashes', 
            price: 100, 
            displayPrice: '@KES 100', 
            category: 'Lashes', 
            image: 'striplashes.jpeg', 
            emoji: '〰', 
            color: '#f9dce6',
            colors: ['Black'],
            colorStock: { 'Black': 15 },
            stock: 25,
            rating: 4.5,
            reviews: 18,
            description: 'Easy-to-apply strip lashes for any look. Reusable and comfortable to wear.'
        },
        { 
            id: 15, 
            name: 'Shoulder Bags', 
            price: 450, 
            displayPrice: 'From @KES 450', 
            category: 'Bags', 
            image: 'bag.jpeg', 
            emoji: '👜', 
            color: '#e7d4f0',
            colors: ['Black', 'White', 'Pink', 'Orange', 'Green', 'Brown'],
            colorStock: { 'Black': 8, 'White': 8, 'Pink': 8, 'Orange': 8, 'Green': 8, 'Brown': 8 },
            stock: 8,
            rating: 4.8,
            reviews: 42,
            description: 'Chic premium-finish handbag to elevate every outfit. Spacious and stylish for daily use.'
        },
        { 
            id: 16, 
            name: 'Headbands', 
            price: 50, 
            displayPrice: 'From @KES 50', 
            category: 'Accessories', 
            image: 'headband.jpeg', 
            emoji: '〰', 
            color: '#f7d6e2',
            colors: ['Pink', 'Black', 'White', 'Purple', 'Yellow', 'Green'],
            colorStock: { 'Pink': 18, 'Black': 18, 'White': 18, 'Purple': 18, 'Yellow': 18, 'Green': 18 },
            stock: 18,
            rating: 4.3,
            reviews: 12,
            description: 'Stylish headbands for every day. Comfortable fit and trendy designs.'
        }
    ];
    
    // Find the product
    const product = allProducts.find(p => String(p.id) === String(productId));
    
    if (!product) {
        showError('Product not found');
        return;
    }
    
    console.log('📦 Found product:', product);
    
    // ============================================
    // RENDER PRODUCT
    // ============================================
    
    // Product Name
    document.getElementById('productName').textContent = product.name;
    
    // Category
    document.getElementById('productCategory').textContent = product.category || 'Accessories';
    
    // Price
    document.getElementById('productPrice').textContent = product.displayPrice || `KES ${product.price}`;
    
    // Description
    document.getElementById('productDescription').textContent = product.description || 'A beautiful addition to your collection. ✨';
    
    // Stock
    const stockText = document.getElementById('productStockText');
    if (stockText) {
        stockText.textContent = `Stock: ${product.stock || 0} pieces`;
    }
    
    // Stock Badge
    const stockBadge = document.getElementById('productStockBadge');
    if (stockBadge) {
        if (product.stock > 10) {
            stockBadge.textContent = '✅ In Stock';
            stockBadge.className = 'product-stock';
        } else if (product.stock > 0) {
            stockBadge.textContent = `⚠️ Only ${product.stock} left`;
            stockBadge.className = 'product-stock low';
        } else {
            stockBadge.textContent = '❌ Out of Stock';
            stockBadge.className = 'product-stock out';
        }
    }
    
    // Rating
    const ratingEl = document.getElementById('productRating');
    if (ratingEl) {
        const stars = '★'.repeat(Math.floor(product.rating || 4.5));
        const emptyStars = '☆'.repeat(5 - Math.floor(product.rating || 4.5));
        ratingEl.textContent = `${stars}${emptyStars} (${product.reviews || 0} reviews)`;
    }
    
    // ============================================
    // COLORS
    // ============================================
    
    const colorsContainer = document.getElementById('productColors');
    let selectedColor = null;
    const colorStock = product.colorStock || {};
    
    if (product.colors && product.colors.length > 0) {
        colorsContainer.innerHTML = product.colors.map(color => {
            const stockCount = colorStock[color] || 0;
            const isOutOfStock = stockCount === 0;
            return `
                <div class="color-swatch ${isOutOfStock ? 'out' : ''}" 
                     style="background:${color.toLowerCase()};${isOutOfStock ? 'opacity:0.5;' : ''}"
                     data-color="${color}"
                     data-stock="${stockCount}"
                     onclick="selectColor('${color}', this)">
                    ${!isOutOfStock ? `<span class="stock-badge">${stockCount}</span>` : '<span class="stock-badge" style="background:#c62828;">0</span>'}
                </div>
            `;
        }).join('');
    } else {
        colorsContainer.innerHTML = '<span style="color:#8b6f8a;">No color options</span>';
    }
    
    // ============================================
    // SELECT COLOR FUNCTION
    // ============================================
    
    window.selectColor = function(color, element) {
        // Remove active from all
        document.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('active'));
        // Add active to clicked
        element.classList.add('active');
        selectedColor = color;
        
        // Update stock display for selected color
        const stockCount = colorStock[color] || 0;
        const stockText = document.getElementById('productStockText');
        if (stockText) {
            stockText.textContent = `${color}: ${stockCount} pieces`;
        }
        
        // Update add to cart button
        const addBtn = document.getElementById('addToCartBtn');
        if (stockCount === 0) {
            addBtn.disabled = true;
            addBtn.textContent = '❌ Out of Stock';
        } else {
            addBtn.disabled = false;
            addBtn.textContent = 'Add to Cart →';
        }
    };
    
    // Select first available color by default
    setTimeout(() => {
        const firstAvailable = document.querySelector('.color-swatch:not(.out)');
        if (firstAvailable) {
            firstAvailable.click();
        } else {
            const first = document.querySelector('.color-swatch');
            if (first) {
                first.click();
                document.getElementById('addToCartBtn').disabled = true;
                document.getElementById('addToCartBtn').textContent = '❌ Out of Stock';
            }
        }
    }, 100);
    
    // ============================================
    // IMAGE
    // ============================================
    
    const img = document.getElementById('productImage');
    const imagePath = `/images/${product.image || 'default.jpeg'}`;
    img.src = imagePath;
    img.alt = product.name;
    img.onerror = function() {
        this.style.display = 'none';
        const container = document.getElementById('productImageContainer');
        container.innerHTML = `
            <div class="product-image-large-placeholder" style="background:${product.color || '#f5edf5'}">
                ${product.emoji || '✨'}
            </div>
        `;
    };
    
    // ============================================
    // ADD TO CART
    // ============================================
    
    document.getElementById('addToCartBtn').addEventListener('click', function() {
        if (this.disabled) return;
        
        // Check if color is selected
        if (!selectedColor) {
            alert('Please select a color first!');
            return;
        }
        
        // Check stock for selected color
        const stockCount = colorStock[selectedColor] || 0;
        if (stockCount === 0) {
            alert('Sorry, this color is out of stock!');
            return;
        }
        
        let cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
        const existing = cart.find(item => String(item.id) === String(product.id) && item.color === selectedColor);
        
        if (existing) {
            if (existing.quantity >= stockCount) {
                alert(`Only ${stockCount} pieces of ${selectedColor} available!`);
                return;
            }
            existing.quantity += 1;
        } else {
            cart.push({ 
                ...product, 
                quantity: 1,
                selectedColor: selectedColor,
                color: product.color
            });
        }
        
        localStorage.setItem('agg-cart', JSON.stringify(cart));
        
        // Update cart count
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
        
        this.textContent = '✅ Added!';
        setTimeout(() => {
            this.textContent = 'Add to Cart →';
        }, 2000);
    });
    
    // ============================================
    // UPDATE CART COUNT ON LOAD
    // ============================================
    
    const cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // ============================================
    // ERROR FUNCTION
    // ============================================
    
    function showError(message) {
        document.getElementById('productDetail').innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;">
                <p style="font-size:4rem;">😅</p>
                <h2 style="color:#4b174f;">${message}</h2>
                <p style="color:#8b6f8a;">We couldn't find the product you're looking for.</p>
                <a href="index.html#shop" style="display:inline-block;margin-top:16px;padding:12px 30px;background:linear-gradient(135deg,#7e39b8,#d5488c);color:#fff;border-radius:99px;text-decoration:none;font-weight:700;">← Back to Shop</a>
            </div>
        `;
    }
    
    console.log('✅ Product detail ready');
});