const PRODUCT_API = `${window.location.origin}/api`;

function displayProductMedia(product) {
  const media = Array.isArray(product.media) && product.media.length
    ? product.media.map((item) => ({
      media_type: item.media_type || item.type || 'image',
      url: item.url || item.file,
      thumbnail_url: item.thumbnail_url || item.thumbnailUrl || item.url || item.file
    }))
    : [{ media_type: 'image', url: product.imageUrl || '/images/patch.jpeg', thumbnail_url: product.imageUrl || '/images/patch.jpeg' }];
  initProductGallery(media);
}

function addProductToCart(product) {
  const quantity = Number(document.getElementById('stepperValue')?.value || 1);
  const cart = JSON.parse(localStorage.getItem('agg-cart') || '[]');
  const existing = cart.find((item) => String(item.id) === String(product.id));
  if (existing) existing.quantity += quantity;
  else cart.push({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity,
    image: (product.imageUrl || '/images/patch.jpeg').split('/').pop(),
    emoji: '✨',
    color: '#f8d5eb'
  });
  localStorage.setItem('agg-cart', JSON.stringify(cart));
  document.getElementById('cartCount').textContent = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
}

async function initializeProductDetail() {
  const id = new URLSearchParams(window.location.search).get('id') || 'prod_1';
  try {
    const response = await fetch(`${PRODUCT_API}/products/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok || !data.product) throw new Error(data.error || 'Product not found.');
    const product = data.product;
    document.title = `${product.name} | Aesthetic Girly Gleam`;
    document.getElementById('productCategoryTag').textContent = product.category || 'Accessories';
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description || 'A beautiful pick for your collection.';
    displayProductMedia(product);
    initVariantSelector([{ id: 'standard', color: 'Standard', size: 'Available', stock_quantity: Number(product.stock || 0), price_adjustment: 0 }], Number(product.price || 0));
    initQuantityStepper();

    document.getElementById('addToCartBtn').addEventListener('click', () => {
      addProductToCart(product);
      document.getElementById('addToCartBtn').textContent = '✓ Added to cart';
    });
    document.getElementById('buyNowMpesaBtn').addEventListener('click', () => {
      addProductToCart(product);
      window.location.href = 'index.html#cart';
    });
    document.getElementById('wishlistHeartBtn').addEventListener('click', function () {
      this.classList.toggle('active');
      this.textContent = this.classList.contains('active') ? '♥' : '♡';
    });
  } catch (error) {
    document.getElementById('productShowcaseSection').innerHTML = `<div class="product-details"><h1>Product unavailable</h1><p>${error.message}</p><a class="button button-dark" href="index.html#shop">Back to shop</a></div>`;
  }
}

document.addEventListener('DOMContentLoaded', initializeProductDetail);
