// ============================================
// PRODUCT DATA - WITH UNIQUE IDs
// ============================================

let products = [
  { 
    id: 1, 
    name: 'Pimple Patches (Heart & Star)', 
    price: 150, 
    displayPrice: '@KES 150', 
    category: 'Skincare',
    image: 'patch.jpeg',
    emoji: '💖', 
    color: '#e937a8',
    stock: 20
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
    stock: 20

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
    stock: 20

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
    stock: 20
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
    stock: 15
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
    stock: 25
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
    stock: 20,
    
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
    stock: 30,
   
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
    stock: 25,
    
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
    stock: 15,
   
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
    stock:10,
    
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
    stock:5,
    
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
    stock:10,
    
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
    stock:20,
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
    stock:20,
    
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
    stock: 18,
    
  }
];

// ============================================
// ✅ MAKE PRODUCTS GLOBALLY ACCESSIBLE
// ============================================

window.products = products;

// ============================================
// STATE
// ============================================

let bestsellers = [1, 2, 13, 15, 9].map(id => products.find(p => p.id === id));
let selectedCategory = 'All';
let currentSlide = 0;
let cart = [];
let carouselTimer;

// ============================================
// DOM REFERENCES
// ============================================

const grid = document.querySelector('#productGrid');
const filters = document.querySelector('#filters');
const productCount = document.querySelector('#productCount');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const cartCount = document.querySelector('#cartCount');
const cartPanel = document.querySelector('#cartPanel');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');

// ============================================
// CART FUNCTIONS
// ============================================

function loadCart() {
  try {
    cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
  } catch {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem('agg-cart', JSON.stringify(cart));
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  cartCount.textContent = quantity;
  cartTotal.textContent = `KES ${total.toLocaleString('en-KE')}`;
  saveCart();

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Your shopping bag is waiting for something cute. ♡</p>';
    return;
  }

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-thumb" style="--thumb-bg:${item.color || '#f5edf5'}">${item.emoji || '🛍️'}</div>
      <div>
        <h3>${item.name}</h3>
        <p>KES ${item.price} each</p>
        <div class="quantity">
          <button data-change="-1" data-id="${item.id}" aria-label="Reduce quantity">−</button>
          <span>${item.quantity}</span>
          <button data-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  renderCart();
  showToast('✨ Added to your shopping bag!');
}

function toggleCart(show) {
  cartPanel.classList.toggle('open', show);
  overlay.classList.toggle('visible', show);
  cartPanel.setAttribute('aria-hidden', String(!show));
}

// ============================================
// TOAST
// ============================================

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2400);
}

// ============================================
// PRODUCT RENDER
// ============================================

function renderProducts() {
  const visible = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);
  
  productCount.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;

  if (visible.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:#8b6f8a;">
        <p style="font-size:3rem;">😅</p>
        <p>No products found in this category.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = visible.map(product => {
    // Get colors
    const colorList = product.colors || [];
    const colorCircles = colorList.slice(0, 4).map(color => 
      `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color.toLowerCase()};border:1px solid #ddd;margin-right:3px;" title="${color}"></span>`
    ).join('');
    
    // Show + if more than 4 colors
    const extraColors = colorList.length > 4 ? `<span style="font-size:0.6rem;color:#8b6f8a;">+${colorList.length - 4}</span>` : '';

    const imagePath = `/images/${product.image || 'default.jpeg'}`;

    return `
      <article class="product-card">
        <div class="product-image" style="--product-bg:${product.color || '#f5edf5'}">
          <img src="${imagePath}" alt="${product.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:4rem;\\'>${product.emoji || '✨'}</span>'">
        </div>
        <div class="product-details">
          <span class="category-tag">${product.category}</span>
          <h3>${product.name}</h3>
          <div style="display:flex;gap:3px;flex-wrap:wrap;margin:4px 0;align-items:center;">
            ${colorCircles}
            ${extraColors}
          </div>
          <div style="font-size:0.7rem;color:#8b6f8a;">📦 ${product.stock || 0} pcs</div>
          <div class="price-row">
            <span class="price">${product.displayPrice}</span>
            <button class="add-button" data-id="${product.id}" aria-label="Add ${product.name} to cart">+</button>
          </div>
          <a class="product-detail-link" href="product-detail.html?id=${product.id}">View details →</a>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================
// FILTERS
// ============================================

function renderFilters() {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  filters.innerHTML = categories.map(cat => `
    <button class="filter ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">${cat}</button>
  `).join('');
}

// ============================================
// CAROUSEL
// ============================================

function renderCarousel() {
  const track = document.querySelector('#carouselTrack');
  const dots = document.querySelector('#carouselDots');

  if (!track || !dots) return;

  track.innerHTML = bestsellers.map(product => {
    const imagePath = `/images/${product.image || 'default.jpeg'}`;
    return `
      <article class="showcase-card">
        <div class="showcase-visual" style="--card-bg:${product.color || '#f5edf5'}">
          <img src="${imagePath}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;border-radius:18px;" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:4rem;\\'>${product.emoji || '✨'}</span>'">
        </div>
        <div class="showcase-copy">
          <p class="eyebrow">Bestseller · ${product.category}</p>
          <h3>${product.name}</h3>
          <p>One of our most-loved little luxuries.</p>
          <p class="showcase-price">${product.displayPrice}</p>
          <button class="button button-dark add-showcase" data-id="${product.id}">Add to bag <span>→</span></button>
        </div>
      </article>
    `;
  }).join('');

  dots.innerHTML = bestsellers.map((_, i) => `
    <button data-slide="${i}" class="${i === 0 ? 'active' : ''}" aria-label="Go to bestseller ${i + 1}"></button>
  `).join('');

  updateSlide();
}

function updateSlide() {
  const track = document.querySelector('#carouselTrack');
  const dots = document.querySelectorAll('#carouselDots button');
  if (!track) return;
  
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function moveSlide(direction) {
  currentSlide = (currentSlide + direction + bestsellers.length) % bestsellers.length;
  updateSlide();
  resetCarouselTimer();
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    currentSlide = (currentSlide + 1) % bestsellers.length;
    updateSlide();
  }, 5500);
}

// ============================================
// EVENT LISTENERS
// ============================================

// Filters
filters.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-category]');
  if (!btn) return;
  selectedCategory = btn.dataset.category;
  renderFilters();
  renderProducts();
});

// Product actions
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-id]');
  if (addBtn && (addBtn.classList.contains('add-button') || addBtn.classList.contains('add-showcase'))) {
    addToCart(Number(addBtn.dataset.id));
    return;
  }

  const changeBtn = e.target.closest('[data-change]');
  if (changeBtn) {
    const id = Number(changeBtn.dataset.id);
    const item = cart.find(p => p.id === id);
    if (item) {
      item.quantity += Number(changeBtn.dataset.change);
      if (item.quantity < 1) {
        cart = cart.filter(p => p.id !== id);
      }
      renderCart();
    }
    return;
  }

  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    const id = Number(removeBtn.dataset.id);
    cart = cart.filter(p => p.id !== id);
    renderCart();
    return;
  }

  const dot = e.target.closest('[data-slide]');
  if (dot) {
    currentSlide = Number(dot.dataset.slide);
    updateSlide();
    resetCarouselTimer();
    return;
  }
});

// Cart toggle
document.querySelector('#cartToggle')?.addEventListener('click', () => toggleCart(true));
document.querySelector('#closeCart')?.addEventListener('click', () => toggleCart(false));
overlay?.addEventListener('click', () => toggleCart(false));

// Carousel controls
document.querySelector('#prevSlide')?.addEventListener('click', () => moveSlide(-1));
document.querySelector('#nextSlide')?.addEventListener('click', () => moveSlide(1));

// Checkout
// ============================================
// COMPLETE CHECKOUT WITH DELIVERY DETAILS
// ============================================

document.querySelector('#checkoutButton')?.addEventListener('click', function() {
    if (cart.length === 0) {
        showToast('Your shopping bag is empty.');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    if (!token) {
        showToast('⚠️ Please login first.');
        localStorage.setItem('agg_redirect_after_login', window.location.href);
        window.location.href = '/login.html?redirect=/index.html#cart';
        return;
    }
    
    // Show delivery modal
    showDeliveryModal();
});

// ============================================
// DELIVERY MODAL
// ============================================

function showDeliveryModal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'deliveryModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        backdrop-filter: blur(4px);
    `;
    
    modal.innerHTML = `
        <div style="
            background: #fff;
            border-radius: 24px;
            padding: 40px;
            max-width: 520px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        ">
            <button id="closeDeliveryModal" style="
                position: absolute;
                top: 16px;
                right: 20px;
                border: 0;
                background: transparent;
                font-size: 1.5rem;
                color: #8b6f8a;
                cursor: pointer;
            ">×</button>
            
            <h2 style="font-family:'Playfair Display',serif;color:#4b174f;margin-top:0;">📦 Delivery Details</h2>
            <p style="color:#8b6f8a;margin-bottom:20px;">Fill in your delivery information</p>
            
            <!-- Customer Name -->
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:4px;font-size:0.85rem;">👤 Full Name *</label>
                <input type="text" id="deliveryName" placeholder="e.g., Liki Faith" style="width:100%;padding:12px 16px;border:2px solid #e8d4e6;border-radius:12px;font-size:0.95rem;transition:border-color 0.3s;">
            </div>
            
            <!-- Delivery Address -->
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:4px;font-size:0.85rem;">📍 Delivery Address *</label>
                <input type="text" id="deliveryAddress" placeholder="e.g., Kasarani, Nairobi" style="width:100%;padding:12px 16px;border:2px solid #e8d4e6;border-radius:12px;font-size:0.95rem;transition:border-color 0.3s;">
            </div>
            
            <!-- Phone Number -->
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:4px;font-size:0.85rem;">📱 Phone Number * (M-Pesa)</label>
                <input type="tel" id="deliveryPhone" placeholder="e.g., 0712345678" style="width:100%;padding:12px 16px;border:2px solid #e8d4e6;border-radius:12px;font-size:0.95rem;transition:border-color 0.3s;">
            </div>
            
            <!-- Delivery Option -->
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:8px;font-size:0.85rem;">🚚 Delivery Option *</label>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                    <button class="delivery-opt selected" data-option="rider" style="
                        padding:10px 8px;
                        border:2px solid #d5488c;
                        border-radius:12px;
                        background:#d5488c;
                        color:#fff;
                        cursor:pointer;
                        font-weight:600;
                        font-size:0.75rem;
                        transition:all 0.3s;
                    ">
                        🏍️ Rider
                    </button>
                    <button class="delivery-opt" data-option="supermetro" style="
                        padding:10px 8px;
                        border:2px solid #e8d4e6;
                        border-radius:12px;
                        background:#fff;
                        color:#4b174f;
                        cursor:pointer;
                        font-weight:600;
                        font-size:0.75rem;
                        transition:all 0.3s;
                    ">
                        🚐 SuperMetro
                    </button>
                    <button class="delivery-opt" data-option="pickupmtaani" style="
                        padding:10px 8px;
                        border:2px solid #e8d4e6;
                        border-radius:12px;
                        background:#fff;
                        color:#4b174f;
                        cursor:pointer;
                        font-weight:600;
                        font-size:0.75rem;
                        transition:all 0.3s;
                    ">
                        📍 PickupMtaani
                    </button>
                </div>
            </div>
            
            <!-- Distance -->
            <div style="margin-bottom:14px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:4px;font-size:0.85rem;">📏 Distance (km)</label>
                <input type="number" id="deliveryDistance" value="5" min="1" max="50" style="width:100%;padding:12px 16px;border:2px solid #e8d4e6;border-radius:12px;font-size:0.95rem;">
                <small style="color:#8b6f8a;font-size:0.7rem;">Estimated distance from our location in Kasarani</small>
            </div>
            
            <!-- Order Notes -->
            <div style="margin-bottom:16px;">
                <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:4px;font-size:0.85rem;">📝 Order Notes</label>
                <textarea id="orderNotes" rows="2" placeholder="Any special instructions..." style="width:100%;padding:12px 16px;border:2px solid #e8d4e6;border-radius:12px;font-size:0.95rem;resize:vertical;font-family:inherit;"></textarea>
            </div>
            
            <!-- Order Summary -->
            <div style="margin-bottom:16px;padding:16px;background:#f8f0f7;border-radius:12px;">
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#8b6f8a;">Subtotal:</span>
                    <span style="font-weight:600;">KES ${subtotal}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:4px 0;">
                    <span style="color:#8b6f8a;">Delivery Fee:</span>
                    <span style="font-weight:600;color:#d5488c;" id="deliveryFeeDisplay">KES 0</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #e8d4e6;margin-top:4px;">
                    <span style="font-weight:700;font-size:1.1rem;">Total:</span>
                    <span style="font-weight:700;font-size:1.2rem;color:#4b174f;" id="totalDisplay">KES ${subtotal}</span>
                </div>
            </div>
            
            <!-- Confirm Button -->
            <button id="confirmOrderBtn" style="
                width:100%;
                padding:16px;
                border:0;
                border-radius:99px;
                background:linear-gradient(135deg,#7e39b8,#d5488c);
                color:#fff;
                font-weight:700;
                font-size:1rem;
                cursor:pointer;
                transition:transform 0.3s, box-shadow 0.3s;
            ">
                ✅ Confirm Order & Pay
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    let selectedOption = 'rider';
    let currentDistance = 5;
    
    // Delivery option selection
    const options = modal.querySelectorAll('.delivery-opt');
    options.forEach(btn => {
        btn.addEventListener('click', function() {
            options.forEach(b => {
                b.style.border = '2px solid #e8d4e6';
                b.style.background = '#fff';
                b.style.color = '#4b174f';
            });
            this.style.border = '2px solid #d5488c';
            this.style.background = '#d5488c';
            this.style.color = '#fff';
            selectedOption = this.dataset.option;
            updateTotals();
        });
    });
    
    // Distance change
    const distanceInput = document.getElementById('deliveryDistance');
    distanceInput.addEventListener('input', function() {
        currentDistance = parseFloat(this.value) || 5;
        updateTotals();
    });
    
    // Calculate delivery fee
    function calculateDeliveryFee(option, distance) {
        const dist = parseFloat(distance) || 5;
        let fee = 0;
        if (option === 'rider') fee = 150 + (dist * 20);
        else if (option === 'supermetro') fee = 100 + (dist * 15);
        else if (option === 'pickupmtaani') fee = 50 + (dist * 10);
        return Math.round(fee / 10) * 10;
    }
    
    // Update totals
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const distance = parseFloat(document.getElementById('deliveryDistance').value) || 5;
        const fee = calculateDeliveryFee(selectedOption, distance);
        const total = subtotal + fee;
        
        document.getElementById('deliveryFeeDisplay').textContent = `KES ${fee}`;
        document.getElementById('totalDisplay').textContent = `KES ${total}`;
    }
    
    // Initial update
    updateTotals();
    
    // Close modal
    document.getElementById('closeDeliveryModal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
    });
    
    // ============================================
    // CONFIRM ORDER
    // ============================================
    document.getElementById('confirmOrderBtn').addEventListener('click', async function() {
        const name = document.getElementById('deliveryName').value.trim();
        const address = document.getElementById('deliveryAddress').value.trim();
        const phone = document.getElementById('deliveryPhone').value.trim();
        const distance = parseFloat(document.getElementById('deliveryDistance').value) || 5;
        const notes = document.getElementById('orderNotes').value.trim();
        
        // Validation
        if (!name || name.length < 2) {
            alert('⚠️ Please enter your full name.');
            document.getElementById('deliveryName').focus();
            return;
        }
        
        if (!address || address.length < 5) {
            alert('⚠️ Please enter your delivery address.');
            document.getElementById('deliveryAddress').focus();
            return;
        }
        
        if (!phone || phone.length < 10) {
            alert('⚠️ Please enter a valid phone number (e.g., 0712345678).');
            document.getElementById('deliveryPhone').focus();
            return;
        }
        
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('⚠️ Please login first.');
            window.location.href = '/login.html';
            return;
        }
        
        // Format phone
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('254')) {
            formattedPhone = '254' + formattedPhone;
        }
        
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const fee = calculateDeliveryFee(selectedOption, distance);
        const total = subtotal + fee;
        
        const orderData = {
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: subtotal,
            total: total,
            delivery_fee: fee,
            delivery_address: address,
            delivery_name: name,
            delivery_option: selectedOption,
            delivery_distance: distance.toString(),
            customer_notes: notes,
            payment_method: 'mpesa'
        };
        
        this.disabled = true;
        this.textContent = '⏳ Processing...';
        
        try {
            // 1. Create Order
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(orderData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                alert(data.error || '❌ Failed to create order');
                this.disabled = false;
                this.textContent = '✅ Confirm Order & Pay';
                return;
            }
            
            // 2. Initiate M-Pesa Payment
            const paymentResponse = await fetch('http://localhost:5000/api/mpesa/pay', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    order_id: data.order.id,
                    phone_number: formattedPhone,
                    amount: data.order.total
                })
            });
            
            const paymentData = await paymentResponse.json();
            
            if (paymentData.success) {
                alert('💰 STK Push sent to your phone!\n\nPlease check your M-Pesa and enter your PIN to complete payment.');
                
                // Clear cart
                cart = [];
                renderCart();
                toggleCart(false);
                modal.remove();
                
                showToast('✅ Order placed successfully! Check your phone.');
            } else {
                alert(paymentData.error || '❌ Payment initiation failed. Please try again.');
                this.disabled = false;
                this.textContent = '✅ Confirm Order & Pay';
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            alert('❌ Could not connect to server. Please try again.');
            this.disabled = false;
            this.textContent = '✅ Confirm Order & Pay';
        }
    });
}

// Mobile menu
document.getElementById('menuButton')?.addEventListener('click', function() {
  document.getElementById('mainNav').classList.toggle('open');
});

// ============================================
// INIT
// ============================================

function init() {
  loadCart();
  renderFilters();
  renderProducts();
  renderCarousel();
  renderCart();
  resetCarouselTimer();

  if (location.hash === '#cart') toggleCart(true);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('✅ Shop page loaded with ' + products.length + ' products!');