let products = [
  { id: 1, name: 'Pimple Patches (Heart & Star)', price: 100, displayPrice: '@KES 100 & @KES 150', category: 'Skincare',media: [
  { file: 'patch.jpeg', type: 'image' },
  { file: 'patch-deliveries.jpeg', type: 'image' },
  { file: 'patch-packaging.jpeg', type: 'image' },
  { file: 'patch-video.mp4', type: 'video' }
], emoji: '💖', color: '#f8d5eb' },
  { id: 2, name: 'Hair Bows', price: 150, displayPrice: '@KES 150 ', category: 'Hair Accessories', image: 'hairbow.jpeg', emoji: '🎀', color: '#ecd9f4' },
  { id: 3, name: 'Hair Clips', price: 70, displayPrice: 'From @KES 70 ', category: 'Hair Accessories', image: 'hairclip.jpeg', emoji: '✨', color: '#f7d8e7' },
  { id: 4, name: 'Edge Brush', price: 100, displayPrice: '@KES 100 ', category: 'Hair Accessories', image: 'edgebrush.jpeg', emoji: '🪮', color: '#e2d7fa' },
  { id: 5, name: 'Satin Scrunchies', price: 100, displayPrice: '@KES 100', category: 'Hair Accessories', image: 'scrunchie.jpeg', emoji: '🩷', color: '#f4d2df' },
  { id: 6, name: 'Necklaces', price: 100, displayPrice: 'From @KES 100', category: 'Jewelry', image: 'necklace.jpeg', emoji: '📿', color: '#eee2be' },
  { id: 7, name: 'Anklets', price: 50, displayPrice: 'From @KES 50', category: 'Jewelry', image: 'anklet.jpeg', emoji: '💫', color: '#e7ddf8' },
  { id: 8, name: 'Earrings', price: 20, displayPrice: 'From @KES 20', category: 'Jewelry', image: 'earrings.jpeg', emoji: '🌸', color: '#f8ddea' },
  { id: 9, name: 'Statement Earrings', price: 100, displayPrice: '@KES 100', category: 'Jewelry', image: 'statement-earrings.jpeg', emoji: '✿', color: '#f4d5f1' },
  { id: 10, name: 'Stainless steel Designer Nose Ring', price: 150, displayPrice: '@KES 150', category: 'Jewelry', image: 'nosering.jpeg', emoji: '◌', color: '#e7dcba' },
  { id: 11, name: 'Stainless steel Septum/Bull Ring', price: 100, displayPrice: '@KES 100', category: 'Jewelry', image: 'septum.jpeg', emoji: '◍', color: '#efd9ee' },
  { id: 12, name: 'Eyelash Clusters', price: 200, displayPrice: 'From @KES 200', category: 'Lashes', image: 'clusters.jpeg', emoji: '◡', color: '#eadff2' },
  { id: 13, name: 'Strip Lashes', price: 100, displayPrice: '@KES 100', category: 'Lashes', image: 'striplashes.jpeg', emoji: '〰', color: '#f9dce6' },
  { id: 14, name: 'moon bags', price: 450, displayPrice: 'From @KES 450', category: 'Bags', image: 'bag.jpeg', emoji: '👜', color: '#e7d4f0' },
  { id: 15, name: 'Headbands', price: 50, displayPrice: 'From @KES 50', category: 'Accessories', image: 'headband.jpeg', emoji: '〰', color: '#f7d6e2' }
];

let bestsellers = [1, 2, 12, 14, 8].map(id => products.find(product => product.id === id));
let selectedCategory = localStorage.getItem('agg-category') || 'All';
localStorage.removeItem('agg-category');
let currentSlide = 0;
let cart;
try { cart = JSON.parse(localStorage.getItem('agg-cart') || '[]'); } catch { cart = []; }
let carouselTimer;

const money = value => `KES ${value.toLocaleString('en-KE')}`;
const grid = document.querySelector('#productGrid');
const filters = document.querySelector('#filters');
const productCount = document.querySelector('#productCount');
const cartItems = document.querySelector('#cartItems');
const cartTotal = document.querySelector('#cartTotal');
const cartCount = document.querySelector('#cartCount');
const cartPanel = document.querySelector('#cartPanel');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');
const galleryDialog = document.querySelector('#galleryDialog');
const galleryTitle = document.querySelector('#galleryTitle');
const galleryMain = document.querySelector('#galleryMain');
const galleryThumbs = document.querySelector('#galleryThumbs');
let galleryProduct;
let galleryIndex = 0;

function saveCart() { localStorage.setItem('agg-cart', JSON.stringify(cart)); }

// Put photos and videos in the images folder. Existing products keep working with `image`.
// To add several files for one product, use: media: [{ file: 'bow.jpg', type: 'image' }, { file: 'bow-video.mp4', type: 'video' }].
function productMedia(product) {
  if (product.media?.length) return product.media.map((media) => ({ ...media, file: media.file || media.url, type: media.type || media.media_type || 'image' }));
  return [{ file: product.image, type: product.mediaType || ((product.image || '').endsWith('.mp4') ? 'video' : 'image') }];
}

function mediaUrl(media) {
  return media.url || (String(media.file).startsWith('/') ? media.file : `/images/${media.file}`);
}

function mediaMarkup(product, size, media = productMedia(product)[0]) {
  const mediaPath = mediaUrl(media);
  const fallback = `<span class="media-fallback">${product.emoji}</span>`;
  if (media.type === 'video') {
    return `<video class="media-asset ${size}-media" muted playsinline preload="metadata" poster="${media.thumbnailUrl || media.thumbnail_url || ''}" onerror="this.remove()"><source src="${mediaPath}" type="video/mp4"></video>${fallback}`;
  }
  return `<img class="media-asset ${size}-media" src="${mediaPath}" alt="${product.name}" onerror="this.remove()">${fallback}`;
}

function renderFilters() {
  const categories = ['All', ...new Set(products.map(product => product.category))];
  filters.innerHTML = categories.map(category => `<button class="filter ${category === selectedCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
}

function renderProducts() {
  const visible = selectedCategory === 'All' ? products : products.filter(product => product.category === selectedCategory);
  productCount.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image" data-label="${productMedia(product)[0].file}" style="--product-bg:${product.color}">${mediaMarkup(product, 'product')}<button class="media-open" data-gallery="${product.id}" aria-label="View ${product.name} gallery">View media ${productMedia(product).length > 1 ? `(${productMedia(product).length})` : ''}</button></div>
      <div class="product-details">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="price-row"><span class="price">${product.displayPrice}</span><button class="add-button" data-id="${product.id}" aria-label="Add ${product.name} to cart">+</button></div>
        <a class="product-detail-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">View details</a>
      </div>
    </article>`).join('');
}

function renderCarousel() {
  const track = document.querySelector('#carouselTrack');
  const dots = document.querySelector('#carouselDots');
  track.innerHTML = bestsellers.map(product => `
    <article class="showcase-card">
      <div class="showcase-visual" style="--card-bg:${product.color}">${mediaMarkup(product, 'showcase')}</div>
      <div class="showcase-copy"><p class="eyebrow">Bestseller · ${product.category}</p><h3>${product.name}</h3><p>One of our most-loved little luxuries. Add this pretty pick to your everyday accessory rotation.</p><p class="showcase-price">${product.displayPrice}</p><button class="gallery-link" data-gallery="${product.id}">View gallery</button><a class="gallery-link" href="product-detail.html?id=${encodeURIComponent(product.id)}">View product details</a><button class="button button-dark add-showcase" data-id="${product.id}">Add to bag <span>→</span></button></div>
    </article>`).join('');
  dots.innerHTML = bestsellers.map((_, index) => `<button data-slide="${index}" class="${index === 0 ? 'active' : ''}" aria-label="Go to bestseller ${index + 1}"></button>`).join('');
  updateSlide();
}

function updateSlide() {
  document.querySelector('#carouselTrack').style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('#carouselDots button').forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
}

function moveSlide(direction) { currentSlide = (currentSlide + direction + bestsellers.length) % bestsellers.length; updateSlide(); resetTimer(); }
function resetTimer() { clearInterval(carouselTimer); }

function addToCart(id) {
  const item = cart.find(product => String(product.id) === String(id));
  if (item) item.quantity += 1;
  else { const product = products.find(product => String(product.id) === String(id)); if (!product) return; cart.push({ ...product, quantity: 1 }); }
  renderCart();
  showToast('Added to your shopping bag ✨');
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = quantity;
  cartTotal.textContent = money(total);
  saveCart();
  cartItems.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item"><div class="cart-thumb" style="--thumb-bg:${item.color}">${item.emoji}</div><div><h3>${item.name}</h3><p>${money(item.price)} each</p><div class="quantity"><button data-change="-1" data-id="${item.id}" aria-label="Reduce quantity">−</button><span>${item.quantity}</span><button data-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div><button class="remove" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button></div>`).join('') : '<p class="empty-cart">Your shopping bag is waiting for something cute. ♡</p>';
}

function toggleCart(show) { cartPanel.classList.toggle('open', show); overlay.classList.toggle('visible', show); cartPanel.setAttribute('aria-hidden', String(!show)); }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }

function openGallery(productId) {
  galleryProduct = products.find(product => String(product.id) === String(productId));
  galleryIndex = 0;
  galleryTitle.textContent = galleryProduct.name;
  renderGallery();
  galleryDialog.showModal();
}

function renderGallery() {
  const media = productMedia(galleryProduct);
  const active = media[galleryIndex];
  const path = mediaUrl(active);
  galleryMain.innerHTML = active.type === 'video'
    ? `<video controls playsinline preload="metadata" poster="${active.thumbnailUrl || active.thumbnail_url || ''}"><source src="${path}" type="video/mp4"></video>`
    : `<img src="${path}" alt="${galleryProduct.name}" onerror="this.replaceWith(Object.assign(document.createElement('p'), {textContent: 'Add ' + '${active.file}' + ' to the images folder to display it.'}))">`;
  galleryThumbs.innerHTML = media.map((item, index) => `<button class="gallery-thumb ${index === galleryIndex ? 'active' : ''}" data-media-index="${index}"><span>${item.type === 'video' ? '▶' : '▣'}</span> ${item.file}</button>`).join('');
}

filters.addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; selectedCategory = button.dataset.category; renderFilters(); renderProducts(); });
document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-id]'); if (addButton && (addButton.classList.contains('add-button') || addButton.classList.contains('add-showcase'))) addToCart(addButton.dataset.id);
  const change = event.target.closest('[data-change]'); if (change) { const item = cart.find(product => String(product.id) === String(change.dataset.id)); if (!item) return; item.quantity += Number(change.dataset.change); if (item.quantity < 1) cart = cart.filter(product => product.id !== item.id); renderCart(); }
  const remove = event.target.closest('[data-remove]'); if (remove) { cart = cart.filter(product => String(product.id) !== String(remove.dataset.remove)); renderCart(); }
  const dot = event.target.closest('[data-slide]'); if (dot) { currentSlide = Number(dot.dataset.slide); updateSlide(); resetTimer(); }
  const galleryButton = event.target.closest('[data-gallery]'); if (galleryButton) openGallery(galleryButton.dataset.gallery);
  const mediaButton = event.target.closest('[data-media-index]'); if (mediaButton) { galleryIndex = Number(mediaButton.dataset.mediaIndex); renderGallery(); }
});
document.querySelector('#cartToggle').addEventListener('click', () => toggleCart(true));
document.querySelector('#closeCart').addEventListener('click', () => toggleCart(false)); overlay.addEventListener('click', () => toggleCart(false));
document.querySelector('#prevSlide').addEventListener('click', () => moveSlide(-1)); document.querySelector('#nextSlide').addEventListener('click', () => moveSlide(1));
async function startMpesaCheckout() {
  if (!cart.length) return showToast('Your shopping bag is empty.');
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (!token) {
    localStorage.setItem('agg_redirect_after_login', '/index.html#cart');
    window.location.href = '/login.html?redirect=/index.html#cart';
    return;
  }
  const address = window.prompt('Delivery address or pickup point:');
  if (!address || address.trim().length < 3) return showToast('Please provide a delivery address or pickup point.');
  const phone = window.prompt('M-Pesa phone number (for example 0712 345 678):');
  if (!phone) return showToast('A phone number is required for M-Pesa.');
  try {
    showToast('Creating your order…');
    const apiBase = window.API_BASE || `${window.location.origin}/api`;
    const orderResponse = await fetch(`${apiBase}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'same-origin',
      body: JSON.stringify({
        items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        delivery_address: address.trim(), phone: phone.trim(), payment_method: 'M-Pesa'
      })
    });
    const orderData = await orderResponse.json().catch(() => ({}));
    if (!orderResponse.ok) throw new Error(orderData.error || 'Could not create your order.');
    const paymentResponse = await fetch(`${apiBase}/mpesa/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'same-origin',
      body: JSON.stringify({ order_id: orderData.order.id, phone_number: phone.trim() })
    });
    const paymentData = await paymentResponse.json().catch(() => ({}));
    if (!paymentResponse.ok) throw new Error(paymentData.error || 'Could not send the M-Pesa prompt.');
    showToast('M-Pesa prompt sent. Complete payment on your phone.');
    const checkoutId = paymentData.checkout_request_id;
    let checks = 0;
    const poll = setInterval(async () => {
      checks += 1;
      try {
        const statusResponse = await fetch(`${apiBase}/mpesa/status/${encodeURIComponent(checkoutId)}`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'same-origin' });
        const statusData = await statusResponse.json().catch(() => ({}));
        if (statusData.status === 'success') {
          clearInterval(poll); cart = []; renderCart(); toggleCart(false); showToast(`Payment received${statusData.receipt_number ? ` · ${statusData.receipt_number}` : ''} ✨`);
        } else if (statusData.status === 'failed' || checks >= 24) {
          clearInterval(poll);
          if (statusData.status === 'failed') showToast(statusData.result_desc || 'Payment was not completed.');
        }
      } catch { /* Keep polling briefly while a callback is in flight. */ }
    }, 5000);
  } catch (error) {
    showToast(error.message || 'Checkout could not be started.');
  }
}

document.querySelector('#checkoutButton').addEventListener('click', startMpesaCheckout);
document.querySelector('#closeGallery').addEventListener('click', () => galleryDialog.close());

async function loadLiveProducts() {
  try {
    const response = await fetch(`${window.API_BASE || `${window.location.origin}/api`}/products`);
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.products) || data.products.length === 0) return;
    products = data.products.filter((product) => product.isActive !== false).map((product, index) => ({
      ...product,
      image: (product.imageUrl || '/images/patch.jpeg').split('/').pop(),
      displayPrice: `KES ${Number(product.price || 0).toLocaleString('en-KE')}`,
      emoji: ['💖', '👜', '✨', '◡', '🎀', '💫'][index % 6],
      color: ['#f8d5eb', '#ecd9f4', '#f7d8e7', '#e2d7fa', '#f4d2df', '#eee2be'][index % 6]
    }));
    bestsellers = products.slice(0, Math.min(5, products.length));
  } catch (error) {
    console.warn('Live catalogue unavailable; using the local catalogue.', error);
  }
}

async function initializeStorefront() {
  await loadLiveProducts();
  renderFilters(); renderProducts(); renderCarousel(); renderCart(); resetTimer();
}

initializeStorefront();
if (location.hash === '#cart') toggleCart(true);
// Mobile menu toggle
document.getElementById('menuButton')?.addEventListener('click', function() {
    document.getElementById('mainNav').classList.toggle('open');
});
