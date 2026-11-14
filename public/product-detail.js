// product-detail.js - Complete with Design Selection
const PRODUCT_API_BASE = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Product detail page loaded');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showError('Product not found');
        return;
    }
    
    // Always use the server catalog so the detail page uses the same current
    // prices, stock, and photos as the shop.
    let products;
    try {
        const response = await fetch(`${PRODUCT_API_BASE}/products`);
        if (!response.ok) throw new Error('Catalog unavailable');
        const payload = await response.json();
        products = (payload.products || []).filter(p => p.isActive !== false).map(p => ({
            ...p,
            image: (p.imageUrl || '').replace(/^\/images\//, ''),
            media: (p.media || []).map(m => ({ ...m, file: m.url || m.file || p.imageUrl }))
        }));
    } catch (error) {
        console.error('Could not load product catalog:', error);
        showError('We could not load this product. Please return to the shop and try again.');
        return;
    }
    
    const product = products.find(p => String(p.id) === String(productId));
    
    if (!product) {
        showError('Product not found');
        return;
    }
    
    console.log('📦 Product:', product);
    
    // ============================================
    // STATE
    // ============================================
    let selectedDesign = product.designs ? product.designs[0] : null;
    let selectedColor = null;
    let currentMediaIndex = 0;
    let quantity = 1;
    
    // Get media for current selection
    function getCurrentMedia() {
        if (selectedDesign && selectedDesign.media) {
            return selectedDesign.media;
        }
        if (product.media) {
            return product.media;
        }
        if (product.image) {
            return [{ file: `/images/${product.image}`, type: 'image' }];
        }
        return [{ file: '/images/patch.jpeg', type: 'image' }];
    }
    
    function getCurrentPrice() {
        return selectedDesign ? selectedDesign.price : product.price;
    }
    
    function getCurrentStock() {
        return selectedDesign ? selectedDesign.stock : product.stock;
    }
    
    // ============================================
    // RENDER PAGE
    // ============================================
    
    // Product Name & Category
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productDescription').textContent = product.description || 'A beautiful addition to your collection. ✨';
    
    // Price
    document.getElementById('productPrice').textContent = `KES ${getCurrentPrice()}`;
    
    // Stock
    document.getElementById('productStock').textContent = getCurrentStock();
    
    // ============================================
    // DESIGNS / VARIANTS
    // ============================================
    const designsContainer = document.getElementById('productDesigns');
    if (product.designs && product.designs.length > 0) {
        designsContainer.parentElement.style.display = 'block';
        designsContainer.innerHTML = product.designs.map((design, index) => `
            <div class="design-option ${index === 0 ? 'active' : ''}" data-index="${index}" style="
                cursor: pointer;
                border: 2px solid ${index === 0 ? '#d5488c' : '#e8d4e6'};
                border-radius: 12px;
                padding: 12px;
                text-align: center;
                transition: all 0.3s;
                background: ${index === 0 ? '#fdf0f7' : '#fff'};
            ">
                <img src="${design.image}" alt="${design.name}" style="
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 6px;
                " onerror="this.style.display='none'">
                <p style="margin: 0; font-size: 0.75rem; font-weight: 600; color: #4b174f;">${design.name}</p>
                <p style="margin: 2px 0 0; font-size: 0.7rem; color: #d5488c; font-weight: 700;">KES ${design.price}</p>
            </div>
        `).join('');
        
        // Design selection handler
        designsContainer.querySelectorAll('.design-option').forEach(option => {
            option.addEventListener('click', function() {
                designsContainer.querySelectorAll('.design-option').forEach(o => {
                    o.style.border = '2px solid #e8d4e6';
                    o.style.background = '#fff';
                });
                this.style.border = '2px solid #d5488c';
                this.style.background = '#fdf0f7';
                
                const index = parseInt(this.dataset.index);
                selectedDesign = product.designs[index];
                currentMediaIndex = 0;
                
                // Update price, stock, media
                document.getElementById('productPrice').textContent = `KES ${getCurrentPrice()}`;
                document.getElementById('productStock').textContent = getCurrentStock();
                renderMedia();
                
                console.log('✅ Selected design:', selectedDesign.name);
            });
        });
    } else {
        // Hide designs section if no designs
        designsContainer.parentElement.style.display = 'none';
    }
    
    // ============================================
    // MEDIA GALLERY
    // ============================================
    function renderMedia() {
        const media = getCurrentMedia();
        const current = media[currentMediaIndex] || media[0];
        const isVideo = current.type === 'video' || (current.file || '').endsWith('.mp4');
        
        const mainContainer = document.getElementById('productMainImageContainer');
        if (isVideo) {
            mainContainer.innerHTML = `
                <video 
                    src="${current.file}" 
                    controls 
                    autoplay 
                    muted 
                    loop 
                    playsinline 
                    style="width:100%;height:100%;object-fit:contain;border-radius:16px;background:#f5edf5;"
                ></video>
            `;
        } else {
            mainContainer.innerHTML = `
                <img 
                    src="${current.file}" 
                    alt="${product.name}" 
                    style="width:100%;height:100%;object-fit:contain;border-radius:16px;background:#f5edf5;"
                    onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:5rem;display:flex;align-items:center;justify-content:center;height:100%;\\'>${product.emoji || '✨'}</span>'"
                >
            `;
        }
        
        // Render thumbnails
        const thumbnailsContainer = document.getElementById('productThumbnails');
        if (media.length > 1) {
            thumbnailsContainer.innerHTML = media.map((m, i) => {
                const isVid = m.type === 'video' || (m.file || '').endsWith('.mp4');
                return `
                    <div class="product-thumbnail-wrapper" data-index="${i}" style="
                        width: 80px;
                        height: 80px;
                        flex-shrink: 0;
                        border-radius: 10px;
                        overflow: hidden;
                        border: 3px solid ${i === currentMediaIndex ? '#d5488c' : 'transparent'};
                        cursor: pointer;
                        position: relative;
                        transition: border-color 0.3s;
                    ">
                        ${isVid ? `
                            <video src="${m.file}" muted style="width:100%;height:100%;object-fit:cover;"></video>
                            <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.5rem;text-shadow:0 2px 4px rgba(0,0,0,0.8);">▶</span>
                        ` : `
                            <img src="${m.file}" alt="Thumbnail ${i+1}" style="width:100%;height:100%;object-fit:cover;">
                        `}
                    </div>
                `;
            }).join('');
            
            thumbnailsContainer.querySelectorAll('.product-thumbnail-wrapper').forEach(thumb => {
                thumb.addEventListener('click', function() {
                    currentMediaIndex = parseInt(this.dataset.index);
                    renderMedia();
                });
            });
        } else {
            thumbnailsContainer.innerHTML = '';
        }
    }
    
    renderMedia();
    
    // ============================================
    // COLORS
    // ============================================
    const colorsContainer = document.getElementById('productColors');
    const colorList = product.colors || [];
    
    if (colorList.length > 0) {
        colorsContainer.innerHTML = colorList.map(color => `
            <div class="color-option" data-color="${color}" style="
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid #ddd;
                background: ${color.toLowerCase()};
                cursor: pointer;
                transition: all 0.3s;
            " title="${color}"></div>
        `).join('');
        
        colorsContainer.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                colorsContainer.querySelectorAll('.color-option').forEach(o => {
                    o.style.border = '3px solid #ddd';
                    o.style.transform = 'scale(1)';
                });
                this.style.border = '3px solid #d5488c';
                this.style.transform = 'scale(1.15)';
                selectedColor = this.dataset.color;
                console.log('✅ Selected color:', selectedColor);
            });
        });
        
        // Auto-select first color
        colorsContainer.querySelector('.color-option')?.click();
    } else {
        colorsContainer.innerHTML = '<span style="color:#8b6f8a;font-size:0.85rem;">No color options</span>';
    }
    
    // ============================================
    // QUANTITY
    // ============================================
    const qtyDisplay = document.getElementById('qtyDisplay');
    
    document.getElementById('qtyMinus').addEventListener('click', function() {
        if (quantity > 1) {
            quantity--;
            qtyDisplay.textContent = quantity;
        }
    });
    
    document.getElementById('qtyPlus').addEventListener('click', function() {
        const maxStock = getCurrentStock();
        if (quantity < maxStock) {
            quantity++;
            qtyDisplay.textContent = quantity;
        } else {
            alert(`Only ${maxStock} pieces available`);
        }
    });
    
    // ============================================
    // ADD TO CART
    // ============================================
    document.getElementById('addToCartBtn').addEventListener('click', function() {
        const stock = getCurrentStock();
        if (stock === 0) {
            alert('❌ Out of stock');
            return;
        }
        
        if (colorList.length > 0 && !selectedColor) {
            alert('⚠️ Please select a color');
            return;
        }
        
        const designName = selectedDesign ? selectedDesign.name : null;
        const itemName = designName ? `${product.name} - ${designName}` : product.name;
        const itemPrice = getCurrentPrice();
        const itemImage = selectedDesign ? selectedDesign.image : product.image;
        
        const cartItem = {
            id: product.id,
            name: itemName,
            price: itemPrice,
            displayPrice: `KES ${itemPrice}`,
            category: product.category,
            image: itemImage,
            emoji: product.emoji,
            color: product.color,
            selectedColor: selectedColor,
            selectedDesign: designName,
            quantity: quantity
        };
        
        // Check if same item (same product + design + color) already in cart
        const existingIndex = cart.findIndex(item => 
            String(item.id) === String(product.id) && 
            item.selectedColor === (selectedColor || null) &&
            item.selectedDesign === designName
        );
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }
        
        // Save and update cart count
        localStorage.setItem('agg-cart', JSON.stringify(cart));
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
        
        // Feedback
        const btn = this;
        const originalText = btn.innerHTML;
        btn.innerHTML = '✅ Added to Cart!';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = 'linear-gradient(135deg, #7e39b8, #d5488c)';
        }, 1500);
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
                <a href="index.html#shop" style="display:inline-block;margin-top:16px;padding:12px 30px;background:linear-gradient(135deg,#7e39b8,#d5488c);color:#fff;border-radius:99px;text-decoration:none;font-weight:700;">← Back to Shop</a>
            </div>
        `;
    }
    
    // ============================================
    // FALLBACK PRODUCTS
    // ============================================
    function getFallbackProducts() {
        return [
            { id: 1, name: 'Pimple Patches', price: 150, displayPrice: '@KES 150', category: 'Skincare', image: 'patch.jpeg', emoji: '💖', color: '#e937a8', colors: ['Pink', 'Clear'], stock: 39, description: 'Ultra-cute hydrocolloid patches.' }
        ];
    }
    
    console.log('✅ Product detail ready');
});
