// Add this at the top of ALL your frontend JS files
const API_BASE = `${window.location.origin}/api`;
const featured = [
  { id: 1, name: 'Pimple Patches (Heart & Star)', price: 100, display: 'KES 100 & KES 150', category: 'Skincare', file: 'patch.jpeg', emoji: '💖', color: '#f8d5e4' },
  { id: 2, name: 'Hair Bows', price: 150, display: 'KES 150', category: 'Hair Accessories', file: 'hairbow.jpeg', emoji: '🎀', color: '#ecd9f4' },
  { id: 12, name: 'Eyelash Clusters', price: 200, display: 'From KES 200', category: 'Lashes', file: 'clusters.jpeg', emoji: '◡', color: '#eadff2' },
  { id: 14, name: 'moon bags', price: 450, display: 'From KES 450', category: 'Bags', file: 'bag.jpeg', emoji: '👜', color: '#e7d4f0' }
];
const bestGrid = document.querySelector('#bestGrid');
const cartCount = document.querySelector('#cartCount');
const toast = document.querySelector('#toast');

function savedCart() { try { return JSON.parse(localStorage.getItem('agg-cart') || '[]'); } catch { return []; } }
function updateCartCount() { cartCount.textContent = savedCart().reduce((sum, item) => sum + item.quantity, 0); }
function toastMessage(message) { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
function renderFeatured() { bestGrid.innerHTML = featured.map(item => `<article class="best-card"><div class="best-media" style="--media:${item.color}"><span>${item.emoji}</span><img src="images/${item.file}" alt="${item.name}" onerror="this.remove()"></div><div class="best-info"><small>${item.category}</small><h3>${item.name}</h3><div class="best-row"><span>${item.display}</span><button data-add="${item.id}" aria-label="Add ${item.name} to cart">+</button></div></div></article>`).join(''); }
function addToCart(id) { const product = featured.find(item => item.id === id); const cart = savedCart(); const existing = cart.find(item => item.id === id); if (existing) existing.quantity += 1; else cart.push({ ...product, displayPrice: product.display, image: product.file, quantity: 1 }); localStorage.setItem('agg-cart', JSON.stringify(cart)); updateCartCount(); toastMessage('Added to your shopping bag ✨'); }

bestGrid.addEventListener('click', event => { const button = event.target.closest('[data-add]'); if (button) addToCart(Number(button.dataset.add)); });
document.querySelector('#menuButton').addEventListener('click', () => document.querySelector('#mainNav').classList.toggle('open'));
document.querySelectorAll('[data-category]').forEach(link => link.addEventListener('click', () => localStorage.setItem('agg-category', link.dataset.category)));
const photoUploadButton = document.querySelector('#photoUploadButton');
const profilePhotoInput = document.querySelector('#profilePhotoInput');
const profilePhotoPreview = document.querySelector('#profilePhotoPreview');

photoUploadButton.addEventListener('click', () => profilePhotoInput.click());
profilePhotoInput.addEventListener('change', () => {
  const [photo] = profilePhotoInput.files;
  if (!photo) return;
  if (!photo.type.startsWith('image/')) {
    toastMessage('Please choose an image file.');
    return;
  }
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    profilePhotoPreview.src = reader.result;
    profilePhotoPreview.hidden = false;
    photoUploadButton.classList.add('has-photo');
    photoUploadButton.setAttribute('aria-label', 'Change your profile photo');
  });
  reader.readAsDataURL(photo);
});
renderFeatured(); updateCartCount();
// Mobile menu toggle
document.getElementById('menuButton')?.addEventListener('click', function() {
    document.getElementById('mainNav').classList.toggle('open');
});
// Show admin link if user is admin
function checkAdminAccess() {
    try {
        const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
        if (user) {
            // Check if admin - you can add a flag in localStorage or fetch from backend
            const adminLink = document.getElementById('adminNavLink');
            if (adminLink) {
                // For now, show admin link if email matches admin email
                // In production, check is_admin from backend
                if (user.email === 'admin@gleam.com' || user.is_admin) {
                    adminLink.style.display = 'inline-block';
                }
            }
        }
    } catch {
        // ignore
    }
}
checkAdminAccess();
