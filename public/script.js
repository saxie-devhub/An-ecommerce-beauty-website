// ============================================
// GALLERY STATE
// ============================================
const API_BASE = `${window.location.origin}/api`;
let currentGalleryProduct = null;
let currentGalleryIndex = 0;

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
     media: [
            { file: '/images/patch.jpeg', type: 'image' },
            { file: '/images/patch-deliveries.jpeg', type: 'image' },
            { file: '/images/patch-packaging.jpeg', type: 'image' },
            { file: '/images/patch-heart-video.mp4', type: 'video' }
        ],
    emoji: '💖', 
    color: '#e937a8',
    colors: ['Pink', 'Clear', 'Yellow', 'Black', 'Purple', 'Green', 'Blue'], 
    stock: 20
  },
  { 
    id: 2, 
    name: 'Pimple Patches (Stars)', 
    price: 100, 
    displayPrice: '@KES 100', 
    category: 'Skincare',
    image: 'patch.jpeg',
    media: [
            { file: '/images/patch-stars.jpeg', type: 'image' },
            { file: '/images/patch-deliveries.jpeg', type: 'image' },
            { file: '/images/patch-packaging.jpeg', type: 'image' },
            { file: '/images/patch-video.mp4', type: 'video' }
        ],
    emoji: '⭐', 
    color: '#f8d5eb',
    colors: ['Pink', 'Clear', 'Yellow', 'Black', 'Purple', 'Green', 'Blue'], 
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
    colors: ['Pink', 'white', 'Black', 'Purple', 'Black', 'Red'],
    stock: 20

  },
  { 
    id: 4, 
    name: 'Hair Clips', 
    price: 70, 
    displayPrice: 'From @KES 70', 
    category: 'Hair Accessories', 
    image: 'hairclip.jpeg', 
     media: [
            { file: '/images/hairclip-1.jpeg', type: 'image' },
            { file: '/images/hairclip-2.jpeg', type: 'image' },
            { file: '/images/hairclip-3.jpeg', type: 'image' },
            { file: '/images/hairclip-4.jpeg', type: 'image' },
            { file: '/images/hairclip-5.jpeg', type: 'image' },
            { file: '/images/hairclip-video.mp4', type: 'video' }
        ],
    emoji: '✨', 
    color: '#e6197c',
    colors: ['Silver', 'Gold', 'Black', 'white'],
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
    colors: ['Pink', 'Green', 'Black', 'Purple', 'Black', 'Blue'],
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
    colors: ['Pink', 'white', 'Black', 'Purple', 'Black', 'Red'],
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
    colors: ['Gold', 'Silver', 'Rose Gold', 'Black'],
    stock: 20,
    // ✅ DESIGNS / VARIANTS
        designs: [
            { 
                name: 'Butterfly Pendant', 
                price: 100, 
                image: '/images/necklace-butterfly.jpeg',
                media: [
                    { file: '/images/necklace-butterfly.jpeg', type: 'image' },
                    { file: '/images/necklace-butterfly-2.jpeg', type: 'image' },
                ],
                stock: 3,
                color:'silver',
                description: 'Dainty butterfly pendant necklace'
            },
            { 
                name: 'Moon Pendant', 
                price: 100, 
                image: '/images/necklace-moon.jpeg',
                media: [
                    { file: '/images/necklace-moon.jpeg', type: 'image' }
                ],
                stock: 1,
                color:'silver',
                description: 'Sweet Moon pendant necklace'
            },
            { 
                name: 'Layered Chain', 
                price: 100, 
                image: '/images/necklace-layered.jpeg',
                media: [
                    { file: '/images/necklace-layered.jpeg', type: 'image' },
                ],
                stock: 1,
                color:'silver',
                description: 'Trendy layered chain necklace'
            },

             {
                name: 'Pearl Chain', 
                price: 100, 
                image: '/images/necklace-pearl.jpeg',
                media: [
                    { file: '/images/necklace-pearl.jpeg', type: 'image' },
                ],
                stock: 2,
                color:'silver',
                description: 'Trendy pearl chain necklace'
            },
            
            { 
                name: 'Round-Beaded Chain', 
                price: 100, 
                image: '/images/necklace-round-beaded.jpeg',
                media: [
                    { file: '/images/necklace-round-beaded.jpeg', type: 'image' },
                    { file: '/images/necklace-round-beaded-2.jpeg', type: 'image' }
                ],
                stock: 2,
                color:'silver',
                description: 'Trendy round-beaded chain necklace'
            },

             { 
                name: 'Star Chain', 
                price: 100, 
                image: '/images/necklace-star.jpeg',
                media: [
                    { file: '/images/necklace-star.jpeg', type: 'image' }
                ],
                stock: 1,
                color:'silver',
                description: 'Trendy star chain necklace'
            },

            { 
                name: 'Heart Chain', 
                price: 100, 
                image: '/images/necklace-heart.jpeg',
                media: [
                    { file: '/images/necklace-heart.jpeg', type: 'image' }
                ],
                stock: 1,
                color:'silver',
                description: 'Trendy heart chain necklace'
            }

          ]
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
    colors: ['silver','Gold','Rose Gold','Black']
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
    colors: ['silver','Gold','Rose Gold','Black']
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
    colors: ['Gold'],
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
    colors: ['silver','Gold','Rose Gold','Black']
    
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
    colors: ['silver','Gold','Rose Gold','Black']
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
    colors: ['Black']
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
    colors: ['Black']
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
   colors: ['Pink', 'Green', 'Black', 'White', 'Brown', 'Beige', 'Orange'],
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
    colors: ['Pink', 'Green', 'Black', 'White', 'Brown', 'Beige', 'Orange'],
    
  },
  { 
    id: 17, 
    name: 'Temporary Tattoos', 
    price: 100, 
    displayPrice: 'From @KES 100', 
    category: 'Tattoos', 
    image: 'tattoo.jpeg',
    media: [
        { file: '/images/tattoo.jpeg', type: 'image' },
        { file: '/images/tattoo-2.jpeg', type: 'image' },
        { file: '/images/tattoo-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#f5e6f0',
    colors: ['Butterfly', 'Flower', 'Star', 'Heart', 'Moon', 'Snake'],
    stock: 50,
    description: 'Cute temporary tattoos that last 3-7 days. Easy to apply, waterproof, and skin-safe.',
  },

  { 
    id: 18, 
    name: 'Colored Temporary Tattoos', 
    price: 50, 
    displayPrice: 'From @KES 50', 
    category: 'Tattoos', 
    image: 'tattoo-colored.jpeg',
    media: [
        { file: '/images/tattoo-colored.jpeg', type: 'image' },
        { file: '/images/tattoo-2-colored.jpeg', type: 'image' },
        { file: '/images/tattoo-3-colored.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#f5e6f0',
    colors: ['Butterfly', 'Flower', 'Star', 'Heart', 'Moon', 'Snake'],
    stock: 20,
    description: 'Cute temporary tattoos that last 3-7 days. Easy to apply, waterproof, and skin-safe.',
  },

  
  { 
    id: 19, 
    name: 'Bath-Gloves', 
    price: 100, 
    displayPrice: 'From @KES 100', 
    category: 'Skincare', 
    image: 'Bath-Gloves.jpeg',
    media: [
        { file: '/images/Bath-Gloves.jpeg', type: 'image' },
        { file: '/images/Bath-Gloves-2.jpeg', type: 'image' },
        { file: '/images/Bath-Gloves-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#f5e6f0',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 10,
    description: 'Cute bathing gloves , easy to use and convient to use.It is made of high quality material and it is durable.',
  },

  
  { 
    id: 20, 
    name: 'Wet wipes ', 
    price: 50, 
    displayPrice: 'From @KES 50', 
    category: 'Skincare', 
    image: 'wet-wipes.jpeg',
    media: [
        { file: '/images/wet-wipes.jpeg', type: 'image' },
        { file: '/images/wet-wipes-2.jpeg', type: 'image' },
        { file: '/images/wet-wipes-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#f5e6f0',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Yellow'],
    stock: 10,
    description: 'Cute wet wipes that are easy to use and skin-safe.',
  },

  
  { 
    id: 21, 
    name: 'Eye mask', 
    price: 70, 
    displayPrice: 'From @KES 70', 
    category: 'Skincare', 
    image: 'eye-mask.jpeg',
    media: [
        { file: '/images/eye-mask-1.jpeg', type: 'image' },
        { file: '/images/eye-mask-2.jpeg', type: 'image' },
        { file: '/images/eye-mask-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#dd1e9d',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 20,
    description: 'Cute eye mask that is skin-safe, removes dark eyes and dark circles.Used to help hydrate the dark circles and brighten the eye  bankss.',
  },

   { 
    id: 22, 
    name: 'Lip mask', 
    price: 70, 
    displayPrice: 'From @KES 70', 
    category: 'Lip care', 
    image: 'lip-mask.jpeg',
    media: [
        { file: '/images/lip-mask-1.jpeg', type: 'image' },
        { file: '/images/lip-mask-2.jpeg', type: 'image' },
        { file: '/images/lip-mask-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#dd1e9d',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 20,
    description: 'Cute lip mask that is skin-safe, removes dark lips and moistures the lips.Used to help hydrate the lips and brighten the lip and avoid dry ,cracky lips.',
  },

   { 
    id: 23, 
    name: 'Pocket tissue ', 
    price: 40, 
    displayPrice: 'From @KES 40', 
    category: 'Skincare', 
    image: 'pocket-tissue.jpeg',
    media: [
        { file: '/images/pocket-tissue-1.jpeg', type: 'image' },
        { file: '/images/pocket-tissue-2.jpeg', type: 'image' },
        { file: '/images/pocket-tissue-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#dd1e9d',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 20,
    description: 'Cute pocket tissue that is skin-safe and convenient for on-the-go use.',
  },
   { 
    id: 24, 
    name: 'waist temporary tattoo', 
    price: 150, 
    displayPrice: 'From @KES 150', 
    category: 'Tattoos', 
    image: 'waist-tattoo.jpeg',
    media: [
        { file: '/images/waist-tattoo-1.jpeg', type: 'image' },
        { file: '/images/waist-tattoo-2.jpeg', type: 'image' },
        { file: '/images/waist-tattoo-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#dd1e9d',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 20,
    description: 'Cute waist temporary tattoo that is skin-safe and fun for on-the-go use.Skin friendly , last for 1-2 weeks and super cute .',
  },
   { 
    id: 25, 
    name: 'sunglasses ', 
    price: 70, 
    displayPrice: 'From @KES 70', 
    category: 'Sunglasses', 
    image: 'sunglasses.jpeg',
    media: [
        { file: '/images/sunglasses-1.jpeg', type: 'image' },
        { file: '/images/sunglasses-2.jpeg', type: 'image' },
        { file: '/images/sunglasses-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#e9b8d9',
    colors: ['Pink', 'Blue', 'Green', 'Grey ', 'Purple'],
    stock: 20,
    description: 'Cute  fashionable sunglasses that are stylish and protect your eyes from the sun.',
  },

   { 
    id: 26, 
    name: 'chunky Rings ', 
    price: 100, 
    displayPrice: 'From @KES 100', 
    category: 'Jewelry', 
    image: 'chunky-rings.jpeg',
    media: [
        { file: '/images/chunky-rings-1.jpeg', type: 'image' },
        { file: '/images/chunky-rings-2.jpeg', type: 'image' },
        { file: '/images/chunky-rings-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#e9b8d9',
    colors: ['silver', 'Gold', 'Rose Gold'],
    stock: 20,
    description: 'Cute  fashionable chunky rings that are stylish and add a touch of glamour to any outfit.',
  },

  { 
    id: 27, 
    name: 'Rings ', 
    price: 50, 
    displayPrice: 'From @KES 50', 
    category: 'Jewelry', 
    image: 'rings.jpeg',
    media: [
        { file: '/images/rings-1.jpeg', type: 'image' },
        { file: '/images/rings-2.jpeg', type: 'image' },
        { file: '/images/rings-3.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#e9b8d9',
    colors: ['silver', 'Gold', 'Rose Gold'],
    stock: 20,
    description: 'Cute  fashionable rings that are stylish and add a touch of glamour to any outfit.',
  },

   { 
    id: 28, 
    name: 'Clear lipgloss ', 
    price: 50, 
    displayPrice: 'From @KES 50', 
    category: 'Lip care', 
    image: 'lipgloss.jpeg',
    media: [
        { file: '/images/lipgloss.jpeg', type: 'image' },
        { file: '/images/lipgloss-1.jpeg', type: 'image' },
        { file: '/images/lipgloss-2.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#e9b8d9',
    colors: ['Clear'],
    stock: 20,
    description: 'Cute  fashionable lipgloss that is stylish and adds a touch of glamour to any outfit.',
  },

  { 
    id: 29, 
    name: 'Mood lipgloss ', 
    price: 50, 
    displayPrice: 'From @KES 50', 
    category: 'Lip care', 
    image: 'mood-lipgloss.jpeg',
    media: [
        { file: '/images/mood-lipgloss.jpeg', type: 'image' },
        { file: '/images/mood-lipgloss-1.jpeg', type: 'image' },
        { file: '/images/mood-lipgloss-2.jpeg', type: 'image' }
    ],
    emoji: '🦋', 
    color: '#e9b8d9',
    colors: ['Pink', 'Blue', 'Green', 'Red ', 'Purple','Cherry'],
    stock: 20,
    description: 'Cute  fashionable coloured  lipgloss that is stylish and adds a touch of glamour to any outfit.Does not affesct your lip condition',
  },




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

    cartItems.innerHTML = cart.map(item => {
        // ✅ Show color if selected
        const colorDisplay = item.selectedColor ? 
            `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${item.selectedColor.toLowerCase()};border:1px solid #ddd;margin-left:4px;"></span> ${item.selectedColor}` : '';
        
        return `
            <div class="cart-item">
                <div class="cart-thumb" style="--thumb-bg:${item.color || '#f5edf5'}">
                    ${item.emoji || '🛍️'}
                </div>
                <div>
                    <h3>${item.name} ${colorDisplay}</h3>
                    <p>KES ${item.price} each</p>
                    <div class="quantity">
                        <button data-change="-1" data-id="${item.id}" aria-label="Reduce quantity">−</button>
                        <span>${item.quantity}</span>
                        <button data-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="remove" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
            </div>
        `;
    }).join('');
}

function addToCart(id) {
  const product = products.find(p => String(p.id) === String(id));
  if (!product) return;
  
  const existing = cart.find(item => String(item.id) === String(id));
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
        const media = getProductImages(product);
        const firstMedia = media[0] || { file: '/images/patch.jpeg', type: 'image' };
        const isVideo = firstMedia.type === 'video' || (firstMedia.file || '').endsWith('.mp4');
        
        // Media HTML
        let mediaHTML = '';
        if (isVideo) {
            mediaHTML = `
                <video 
                    src="${firstMedia.file}" 
                    muted 
                    loop 
                    playsinline 
                    preload="metadata"
                    style="width:100%;height:100%;object-fit:cover;border-radius:12px;"
                    onmouseover="this.play()" 
                    onmouseout="this.pause()"
                    onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:4rem;\\'>${product.emoji || '✨'}</span>'">
                </video>
                <span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,0.7);color:#fff;padding:2px 8px;border-radius:99px;font-size:0.65rem;font-weight:700;z-index:3;">▶ Video</span>
            `;
        } else {
            mediaHTML = `
                <img 
                    src="${firstMedia.file}" 
                    alt="${product.name}" 
                    loading="lazy"
                    style="width:100%;height:100%;object-fit:cover;border-radius:12px;"
                    onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:4rem;\\'>${product.emoji || '✨'}</span>'">
            `;
        }
        
        // ✅ REMOVED color circles from here
        // ✅ Only show product count badge
        const totalMedia = media.length;
        const mediaBadge = totalMedia > 1 ? `
            <span style="
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0,0,0,0.7);
                color: #fff;
                padding: 2px 8px;
                border-radius: 99px;
                font-size: 0.65rem;
                font-weight: 700;
                z-index: 3;
            ">📷 ${totalMedia}</span>
        ` : '';

        return `
            <article class="product-card">
                <div class="product-image" style="--product-bg:${product.color || '#f5edf5'}; cursor: pointer; position: relative;" onclick="openProductGallery('${product.id}')">
                    ${mediaHTML}
                    ${mediaBadge}
                </div>
                <div class="product-details">
                    <span class="category-tag">${product.category}</span>
                    <h3>${product.name}</h3>
                    <!-- ✅ REMOVED color circles -->
                    <div style="font-size:0.7rem;color:#8b6f8a;">📦 ${product.stock || 0} pcs</div>
                    <div class="price-row">
                        <span class="price">${product.displayPrice}</span>
                        <button class="add-button" data-id="${product.id}" aria-label="Add ${product.name} to cart">+</button>
                    </div>
                    <a class="product-detail-link" href="product-detail.html?id=${product.id}" onclick="event.stopPropagation();">View details →</a>
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
    addToCart(addBtn.dataset.id);
    return;
  }

  const changeBtn = e.target.closest('[data-change]');
  if (changeBtn) {
    const id = changeBtn.dataset.id;
    const item = cart.find(p => String(p.id) === String(id));
    if (item) {
      item.quantity += Number(changeBtn.dataset.change);
      if (item.quantity < 1) {
        cart = cart.filter(p => String(p.id) !== String(id));
      }
      renderCart();
    }
    return;
  }

  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    const id = removeBtn.dataset.remove;
    cart = cart.filter(p => String(p.id) !== String(id));
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
    
    // ✅ Check authentication FIRST
    const token = localStorage.getItem('access_token');
    const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
    
    if (!token || !user) {
        // Save current page to redirect back after login
        localStorage.setItem('agg_redirect_after_login', window.location.href);
        showToast('⚠️ Please login to checkout.');
        setTimeout(() => {
            window.location.href = '/login.html?redirect=/index.html#cart';
        }, 500);
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
        // 👇 PASTE THIS AFTER DELIVERY OPTIONS
<div style="margin-bottom:14px;">
    <label style="display:block;font-weight:600;color:#4b174f;margin-bottom:8px;font-size:0.85rem;">💳 Payment Method</label>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <button class="payment-opt selected" data-payment="mpesa" style="
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
            💳 M-Pesa
        </button>
        <button class="payment-opt" data-payment="cash" style="
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
            💵 Cash on Delivery
        </button>
    </div>
</div>

<!-- M-Pesa Paybill Details -->
<div id="mpesaDetails" style="margin-bottom:14px;padding:12px;background:#f0f7ff;border-radius:12px;border:1px solid #d4e4f7;">
    <p style="margin:0;font-size:0.8rem;color:#4b174f;">
        <strong>💳 M-Pesa Pochi La Biashara:</strong><br>
        <span style="font-size:1.1rem;color:#d5488c;font-weight:700;">0728091300</span><br>
        <span style="font-size:0.7rem;color:#8b6f8a;">Pochi La Biashara</span>
    </p>
    <p style="margin:4px 0 0;font-size:0.7rem;color:#8b6f8a;">
        You will receive an STK Push on your phone to complete payment.
    </p>
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
            phone: formattedPhone,
            delivery_notes: notes,
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
            const response = await fetch(`${API_BASE}/orders`, {
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
            const paymentResponse = await fetch(`${API_BASE}/mpesa/pay`, {
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
                const orderNumber = data.order.order_number || data.order.id;
                localStorage.setItem('agg_last_order', orderNumber);
                // The API response only confirms that Safaricom accepted the request.
                // The order remains pending until the authenticated callback confirms payment.
                cart = [];
                renderCart();
                toggleCart(false);
                modal.remove();
                alert(`Order ${orderNumber} is saved and awaiting payment.\n\nSafaricom accepted the payment request, but payment is NOT confirmed yet. Sandbox tests may not send an SMS to a real phone; check the Daraja simulator. Your order will only be marked paid after a successful callback.`);
                showToast('Order saved · payment pending');
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
// PRODUCT GALLERY WITH VIDEO SUPPORT
// ============================================

function openProductGallery(productId) {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;
    
    currentGalleryProduct = product;
    currentGalleryIndex = 0;
    
    const media = getProductImages(product);
    const colorList = product.colors || [];
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'galleryModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        overflow-y: auto;
    `;
    
    // ✅ Function to render current media (image or video)
    function renderCurrentMedia() {
        const current = media[currentGalleryIndex];
        const isVideo = current.type === 'video' || (current.file || '').endsWith('.mp4');
        
        if (isVideo) {
            return `
                <video 
                    id="galleryMainVideo"
                    src="${current.file}" 
                    controls 
                    autoplay 
                    muted 
                    loop 
                    playsinline 
                    preload="metadata"
                    style="max-width:100%;max-height:60vh;object-fit:contain;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);"
                    onerror="this.style.display='none';this.parentElement.innerHTML='<p style=\\'color:#fff;\\'>Video not found</p>'">
                </video>
            `;
        } else {
            return `
                <img 
                    id="galleryMainImage"
                    src="${current.file}" 
                    alt="${product.name}" 
                    style="max-width:100%;max-height:60vh;object-fit:contain;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            `;
        }
    }
    
    modal.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 40px;
            max-width: 1200px;
            width: 100%;
            flex-wrap: wrap;
        ">
            <!-- LEFT: MEDIA GALLERY -->
            <div style="flex:1;min-width:300px;max-width:500px;display:flex;flex-direction:column;align-items:center;">
                <div style="position: relative; width: 100%; max-height: 60vh; display: flex; align-items: center; justify-content: center;">
                    <div id="galleryMediaContainer" style="width:100%;display:flex;align-items:center;justify-content:center;">
                        ${renderCurrentMedia()}
                    </div>
                    
                    ${media.length > 1 ? `
                        <button id="galleryPrev" style="
                            position: absolute;
                            left: -20px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: rgba(255,255,255,0.9);
                            color: #4b174f;
                            border: 0;
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            font-size: 1.3rem;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            z-index: 10;
                        ">‹</button>
                        <button id="galleryNext" style="
                            position: absolute;
                            right: -20px;
                            top: 50%;
                            transform: translateY(-50%);
                            background: rgba(255,255,255,0.9);
                            color: #4b174f;
                            border: 0;
                            width: 44px;
                            height: 44px;
                            border-radius: 50%;
                            font-size: 1.3rem;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                            z-index: 10;
                        ">›</button>
                    ` : ''}
                </div>
                
                ${media.length > 1 ? `
                    <p style="color: #fff; font-size: 0.85rem; margin: 12px 0 0; background: rgba(0,0,0,0.5); padding: 4px 16px; border-radius: 99px;">
                        <span id="galleryCounter">1 / ${media.length}</span>
                    </p>
                ` : ''}
                
                ${media.length > 1 ? `
                    <div style="display:flex;gap:8px;margin-top:12px;overflow-x:auto;max-width:100%;padding:4px;">
                        ${media.map((m, i) => {
                            const isVid = m.type === 'video' || (m.file || '').endsWith('.mp4');
                            return `
                                <div class="gallery-thumb-wrapper" data-index="${i}" style="
                                    position: relative;
                                    width: 70px;
                                    height: 70px;
                                    flex-shrink: 0;
                                    border-radius: 10px;
                                    overflow: hidden;
                                    border: 3px solid ${i === 0 ? '#d5488c' : 'rgba(255,255,255,0.3)'};
                                    cursor: pointer;
                                    transition: border-color 0.3s;
                                ">
                                    ${isVid ? `
                                        <video src="${m.file}" muted style="width:100%;height:100%;object-fit:cover;"></video>
                                        <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.2rem;text-shadow:0 2px 4px rgba(0,0,0,0.8);">▶</span>
                                    ` : `
                                        <img src="${m.file}" alt="Image ${i + 1}" style="width:100%;height:100%;object-fit:cover;">
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}
            </div>
            
            <!-- RIGHT: PRODUCT INFO + ADD TO CART -->
            <div style="
                flex: 1;
                min-width: 280px;
                max-width: 400px;
                color: #fff;
                padding: 24px;
                background: rgba(255,255,255,0.05);
                border-radius: 20px;
                backdrop-filter: blur(10px);
            ">
                <button id="closeGalleryModal" style="
                    float: right;
                    background: rgba(255,255,255,0.15);
                    color: #fff;
                    border: 0;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 1.3rem;
                    cursor: pointer;
                    margin-left: 12px;
                ">×</button>
                
                <p style="color: #d5488c; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 8px;">${product.category}</p>
                
                <h2 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; margin: 0 0 12px; line-height: 1.2;">${product.name}</h2>
                
                <p style="color: #d5488c; font-size: 1.5rem; font-weight: 700; margin: 0 0 16px;">${product.displayPrice || 'KES ' + product.price}</p>
                
                <p style="color: rgba(255,255,255,0.75); font-size: 0.9rem; line-height: 1.6; margin: 0 0 20px;">${product.description || 'A beautiful addition to your collection. ✨'}</p>
                
                ${colorList.length > 0 ? `
                    <div style="margin-bottom: 16px;">
                        <p style="font-size: 0.8rem; font-weight: 600; margin: 0 0 8px;">🎨 Available Colors:</p>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="galleryColors">
                            ${colorList.map(color => `
                                <button class="gallery-color" data-color="${color}" style="
                                    width: 36px;
                                    height: 36px;
                                    border-radius: 50%;
                                    border: 3px solid rgba(255,255,255,0.3);
                                    background: ${color.toLowerCase()};
                                    cursor: pointer;
                                    transition: all 0.3s;
                                " title="${color}"></button>
                            `).join('')}
                        </div>
                        <p style="font-size: 0.7rem; color: rgba(255,255,255,0.5); margin: 6px 0 0;" id="selectedColorText">Tap a color to select</p>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 20px;">
                    <p style="font-size: 0.8rem; font-weight: 600; margin: 0 0 8px;">📦 Quantity:</p>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button id="galleryQtyMinus" style="width: 36px; height: 36px; border-radius: 50%; border: 0; background: rgba(255,255,255,0.15); color: #fff; font-size: 1.2rem; cursor: pointer;">−</button>
                        <span id="galleryQty" style="font-size: 1.2rem; font-weight: 700; min-width: 30px; text-align: center;">1</span>
                        <button id="galleryQtyPlus" style="width: 36px; height: 36px; border-radius: 50%; border: 0; background: rgba(255,255,255,0.15); color: #fff; font-size: 1.2rem; cursor: pointer;">+</button>
                    </div>
                </div>
                
                <p style="font-size: 0.8rem; color: ${product.stock > 5 ? '#4ade80' : '#fbbf24'}; margin: 0 0 16px;">
                    ${product.stock > 0 ? `✅ ${product.stock} pieces available` : '❌ Out of stock'}
                </p>
                
                <button id="galleryAddToCart" style="
                    width: 100%;
                    padding: 16px;
                    border: 0;
                    border-radius: 99px;
                    background: linear-gradient(135deg, #7e39b8, #d5488c);
                    color: #fff;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    margin-bottom: 10px;
                ">🛍️ Add to Cart</button>
                
                <a href="product-detail.html?id=${product.id}" style="
                    display: block;
                    text-align: center;
                    color: #d5488c;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-decoration: underline;
                ">View full details →</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ============================================
    // GALLERY NAVIGATION
    // ============================================
    
    function updateGallery() {
        const container = document.getElementById('galleryMediaContainer');
        container.innerHTML = renderCurrentMedia();
        
        const counter = document.getElementById('galleryCounter');
        if (counter) counter.textContent = `${currentGalleryIndex + 1} / ${media.length}`;
        
        // Update thumbnails
        modal.querySelectorAll('.gallery-thumb-wrapper').forEach((thumb, i) => {
            thumb.style.borderColor = i === currentGalleryIndex ? '#d5488c' : 'rgba(255,255,255,0.3)';
        });
    }
    
    document.getElementById('galleryPrev')?.addEventListener('click', function() {
        currentGalleryIndex = (currentGalleryIndex - 1 + media.length) % media.length;
        updateGallery();
    });
    
    document.getElementById('galleryNext')?.addEventListener('click', function() {
        currentGalleryIndex = (currentGalleryIndex + 1) % media.length;
        updateGallery();
    });
    
    modal.querySelectorAll('.gallery-thumb-wrapper').forEach(thumb => {
        thumb.addEventListener('click', function() {
            currentGalleryIndex = parseInt(this.dataset.index);
            updateGallery();
        });
    });
    
    // ... (rest of the code: quantity, colors, add to cart, close)
    
    // Quantity
    let quantity = 1;
    const qtyDisplay = document.getElementById('galleryQty');
    
    document.getElementById('galleryQtyMinus')?.addEventListener('click', function() {
        if (quantity > 1) {
            quantity--;
            qtyDisplay.textContent = quantity;
        }
    });
    
    document.getElementById('galleryQtyPlus')?.addEventListener('click', function() {
        if (quantity < (product.stock || 99)) {
            quantity++;
            qtyDisplay.textContent = quantity;
        }
    });
    
    // Colors
    let selectedColor = null;
    const colorButtons = modal.querySelectorAll('.gallery-color');
    const colorText = document.getElementById('selectedColorText');
    
    colorButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            colorButtons.forEach(b => {
                b.style.borderColor = 'rgba(255,255,255,0.3)';
                b.style.transform = 'scale(1)';
            });
            this.style.borderColor = '#d5488c';
            this.style.transform = 'scale(1.15)';
            selectedColor = this.dataset.color;
            if (colorText) colorText.textContent = `Selected: ${selectedColor}`;
        });
    });
    
    if (colorButtons.length > 0) colorButtons[0].click();
    
    // Add to cart
    document.getElementById('galleryAddToCart').addEventListener('click', function() {
        if (product.stock === 0) {
            alert('❌ Out of stock');
            return;
        }
        
        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            displayPrice: product.displayPrice,
            category: product.category,
            image: product.image,
            emoji: product.emoji,
            color: product.color,
            selectedColor: selectedColor,
            quantity: quantity
        };
        
        const existingIndex = cart.findIndex(item => 
            String(item.id) === String(product.id) && 
            item.selectedColor === (selectedColor || null)
        );
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push(cartItem);
        }
        
        saveCart();
        renderCart();
        
        this.innerHTML = '✅ Added!';
        this.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        setTimeout(() => {
            this.innerHTML = '🛍️ Add to Cart';
            this.style.background = 'linear-gradient(135deg, #7e39b8, #d5488c)';
        }, 1500);
        
        showToast(`✨ ${product.name} added to cart!`);
    });
    
    // Close
    document.getElementById('closeGalleryModal').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    
    document.addEventListener('keydown', function(e) {
        if (!document.getElementById('galleryModal')) return;
        if (e.key === 'Escape') modal.remove();
        if (e.key === 'ArrowLeft' && media.length > 1) {
            currentGalleryIndex = (currentGalleryIndex - 1 + media.length) % media.length;
            updateGallery();
        }
        if (e.key === 'ArrowRight' && media.length > 1) {
            currentGalleryIndex = (currentGalleryIndex + 1) % media.length;
            updateGallery();
        }
    });
}
// ============================================
// GET PRODUCT MEDIA (Returns objects with type)
// ============================================

function getProductImages(product) {
    // If product has multiple media items
    if (product.media && product.media.length > 0) {
        return product.media.map(m => {
            // If already has type, return as is
            if (typeof m === 'object' && m.type) {
                return m;
            }
            // If string, detect type
            const file = typeof m === 'string' ? m : (m.file || m.url || '');
            const isVideo = file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mov');
            return {
                file: file,
                type: isVideo ? 'video' : 'image'
            };
        });
    }
    
    // Single image fallback
    if (product.image) {
        const isVideo = product.image.endsWith('.mp4');
        return [{
            file: `/images/${product.image}`,
            type: isVideo ? 'video' : 'image'
        }];
    }
    
    // Default fallback
    return [{
        file: '/images/patch.jpeg',
        type: 'image'
    }];
}
// ============================================
// INIT
// ============================================

function init() {
  loadCart();
  fetch(`${API_BASE}/products`)
    .then(response => { if (!response.ok) throw new Error('Could not load products'); return response.json(); })
    .then(({ products: catalog = [] }) => {
      products = catalog.filter(p => p.isActive !== false).map(p => ({
        ...p,
        image: (p.imageUrl || '').replace(/^\/images\//, ''),
        displayPrice: (p.displayPrice || `KES ${Number(p.price).toLocaleString('en-KE')}`).replace(/@/g, ''),
        media: (p.media || []).map(m => ({ ...m, file: m.url || m.file || p.imageUrl, thumbnailUrl: m.thumbnailUrl || m.thumbnail_url }))
      }));
      window.products = products;
      bestsellers = products.slice(0, 5);
      cart = cart.map(item => {
        const product = products.find(p => String(p.id) === String(item.id));
        return product ? { ...item, ...product, quantity: Math.max(1, Number(item.quantity) || 1) } : item;
      }).filter(item => products.some(p => String(p.id) === String(item.id)));
      renderFilters(); renderProducts(); renderCarousel(); renderCart();
    })
    .catch(error => { console.error(error); showToast('Could not load the shop. Please refresh.'); });
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
