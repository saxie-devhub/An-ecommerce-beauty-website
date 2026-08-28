const products = [
  { id: 1, name: 'Pimple Patches (Heart & Star)', price: 100, displayPrice: 'KES 100 & KES 150', category: 'Skincare', image: 'patch.jpg', emoji: '💖', color: '#f8d5e4' },
  { id: 2, name: 'Hair Bows', price: 150, displayPrice: 'KES 150', category: 'Hair Accessories', image: 'hairbow.jpg', emoji: '🎀', color: '#ecd9f4' },
  { id: 3, name: 'Hair Clips', price: 70, displayPrice: 'From KES 70', category: 'Hair Accessories', image: 'hairclip.jpg', emoji: '✨', color: '#f7d8e7' },
  { id: 4, name: 'Edge Brush', price: 100, displayPrice: 'KES 100', category: 'Hair Accessories', image: 'edgebrush.jpg', emoji: '🪮', color: '#e2d7fa' },
  { id: 5, name: 'Satin Scrunchies', price: 100, displayPrice: 'KES 100', category: 'Hair Accessories', image: 'scrunchie.jpg', emoji: '🩷', color: '#f4d2df' },
  { id: 6, name: 'Necklaces', price: 100, displayPrice: 'From KES 100', category: 'Jewelry', image: 'necklace.jpg', emoji: '📿', color: '#eee2be' },
  { id: 7, name: 'Anklets', price: 50, displayPrice: 'From KES 50', category: 'Jewelry', image: 'anklet.jpg', emoji: '💫', color: '#e7ddf8' },
  { id: 8, name: 'Earrings', price: 10, displayPrice: 'From KES 10', category: 'Jewelry', image: 'earrings.jpg', emoji: '🌸', color: '#f8ddea' },
  { id: 9, name: 'Statement Earrings', price: 100, displayPrice: 'KES 100', category: 'Jewelry', image: 'statement-earrings.jpg', emoji: '✿', color: '#f4d5f1' },
  { id: 10, name: 'Fake Designer Nose Ring', price: 150, displayPrice: 'KES 150', category: 'Jewelry', image: 'nosering.jpg', emoji: '◌', color: '#e7dcba' },
  { id: 11, name: 'Fake Septum/Bull Ring', price: 100, displayPrice: 'KES 100', category: 'Jewelry', image: 'septum.jpg', emoji: '◍', color: '#efd9ee' },
  { id: 12, name: 'Eyelash Clusters', price: 200, displayPrice: 'From KES 200', category: 'Lashes', image: 'clusters.jpg', emoji: '◡', color: '#eadff2' },
  { id: 13, name: 'Strip Lashes', price: 100, displayPrice: 'KES 100', category: 'Lashes', image: 'striplashes.jpg', emoji: '〰', color: '#f9dce6' },
  { id: 14, name: 'Shoulder Bags', price: 450, displayPrice: 'From KES 450', category: 'Bags', image: 'bag.jpg', emoji: '👜', color: '#e7d4f0' },
  { id: 15, name: 'Headbands', price: 50, displayPrice: 'From KES 50', category: 'Accessories', image: 'headband.jpg', emoji: '〰', color: '#f7d6e2' }
];

const bestsellers = [1, 2, 12, 14, 8].map(id => products.find(product => product.id === id));
let selectedCategory = 'All';
let currentSlide = 0;
let cart = [];
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

function renderFilters() {
  const categories = ['All', ...new Set(products.map(product => product.category))];
  filters.innerHTML = categories.map(category => `<button class="filter ${category === selectedCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
}

function renderProducts() {
  const visible = selectedCategory === 'All' ? products : products.filter(product => product.category === selectedCategory);
  productCount.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
  grid.innerHTML = visible.map(product => `
    <article class="product-card">
      <div class="product-image" data-label="${product.image}" style="--product-bg:${product.color}"><span>${product.emoji}</span></div>
      <div class="product-details">
        <span class="category-tag">${product.category}</span>
        <h3>${product.name}</h3>
        <div class="price-row"><span class="price">${product.displayPrice}</span><button class="add-button" data-id="${product.id}" aria-label="Add ${product.name} to cart">+</button></div>
      </div>
    </article>`).join('');
}

function renderCarousel() {
  const track = document.querySelector('#carouselTrack');
  const dots = document.querySelector('#carouselDots');
  track.innerHTML = bestsellers.map(product => `
    <article class="showcase-card">
      <div class="showcase-visual" style="--card-bg:${product.color}"><span>${product.emoji}</span></div>
      <div class="showcase-copy"><p class="eyebrow">Bestseller · ${product.category}</p><h3>${product.name}</h3><p>One of our most-loved little luxuries. Add this pretty pick to your everyday accessory rotation.</p><p class="showcase-price">${product.displayPrice}</p><button class="button button-dark add-showcase" data-id="${product.id}">Add to bag <span>→</span></button></div>
    </article>`).join('');
  dots.innerHTML = bestsellers.map((_, index) => `<button data-slide="${index}" class="${index === 0 ? 'active' : ''}" aria-label="Go to bestseller ${index + 1}"></button>`).join('');
  updateSlide();
}

function updateSlide() {
  document.querySelector('#carouselTrack').style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll('#carouselDots button').forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
}

function moveSlide(direction) { currentSlide = (currentSlide + direction + bestsellers.length) % bestsellers.length; updateSlide(); resetTimer(); }
function resetTimer() { clearInterval(carouselTimer); carouselTimer = setInterval(() => { currentSlide = (currentSlide + 1) % bestsellers.length; updateSlide(); }, 5500); }

function addToCart(id) {
  const item = cart.find(product => product.id === id);
  if (item) item.quantity += 1;
  else { const product = products.find(product => product.id === id); cart.push({ ...product, quantity: 1 }); }
  renderCart();
  showToast('Added to your shopping bag ✨');
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = quantity;
  cartTotal.textContent = money(total);
  cartItems.innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item"><div class="cart-thumb" style="--thumb-bg:${item.color}">${item.emoji}</div><div><h3>${item.name}</h3><p>${money(item.price)} each</p><div class="quantity"><button data-change="-1" data-id="${item.id}" aria-label="Reduce quantity">−</button><span>${item.quantity}</span><button data-change="1" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div><button class="remove" data-remove="${item.id}" aria-label="Remove ${item.name}">×</button></div>`).join('') : '<p class="empty-cart">Your shopping bag is waiting for something cute. ♡</p>';
}

function toggleCart(show) { cartPanel.classList.toggle('open', show); overlay.classList.toggle('visible', show); cartPanel.setAttribute('aria-hidden', String(!show)); }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }

filters.addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; selectedCategory = button.dataset.category; renderFilters(); renderProducts(); });
document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-id]'); if (addButton && (addButton.classList.contains('add-button') || addButton.classList.contains('add-showcase'))) addToCart(Number(addButton.dataset.id));
  const change = event.target.closest('[data-change]'); if (change) { const item = cart.find(product => product.id === Number(change.dataset.id)); item.quantity += Number(change.dataset.change); if (item.quantity < 1) cart = cart.filter(product => product.id !== item.id); renderCart(); }
  const remove = event.target.closest('[data-remove]'); if (remove) { cart = cart.filter(product => product.id !== Number(remove.dataset.remove)); renderCart(); }
  const dot = event.target.closest('[data-slide]'); if (dot) { currentSlide = Number(dot.dataset.slide); updateSlide(); resetTimer(); }
});
document.querySelector('#cartToggle').addEventListener('click', () => toggleCart(true));
document.querySelector('#closeCart').addEventListener('click', () => toggleCart(false)); overlay.addEventListener('click', () => toggleCart(false));
document.querySelector('#prevSlide').addEventListener('click', () => moveSlide(-1)); document.querySelector('#nextSlide').addEventListener('click', () => moveSlide(1));
document.querySelector('#checkoutButton').addEventListener('click', () => showToast(cart.length ? 'Checkout is ready to connect to your preferred payment method.' : 'Your shopping bag is empty.'));

renderFilters(); renderProducts(); renderCarousel(); renderCart(); resetTimer();
