// public/product-showcase.js - Interactive Product Gallery, Variants & M-Pesa Client
const API_BASE = `${window.location.origin}/api`;

/**
 * ============================================
 * 1. ADVANCED PRODUCT MEDIA GALLERY
 * ============================================
 * Supports multiple images + inline video playback + interactive zoom
 */
function initProductGallery(mediaItems) {
  const viewport = document.getElementById('mainGalleryViewport');
  const strip = document.getElementById('thumbnailStrip');
  if (!viewport || !strip || !mediaItems || mediaItems.length === 0) return;

  // Render thumbnail buttons
  strip.innerHTML = mediaItems
    .map(
      (m, idx) => `
      <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
        <img src="${m.thumbnail_url || m.url}" alt="Thumbnail ${idx + 1}" onerror="this.onerror=null;this.src='/images/patch.jpeg'" />
        ${m.media_type === 'video' ? '<span class="video-play-badge">▶</span>' : ''}
      </div>`
    )
    .join('');

  function displayMedia(mediaObj) {
    if (mediaObj.media_type === 'video') {
      viewport.innerHTML = `
        <video controls autoplay loop playsinline>
          <source src="${mediaObj.url}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>`;
      viewport.style.cursor = 'default';
    } else {
      viewport.innerHTML = `<img src="${mediaObj.url}" id="galleryMainImg" alt="Product Image" />`;
      viewport.style.cursor = 'zoom-in';

      // Setup Image Zoom
      const img = document.getElementById('galleryMainImg');
      viewport.onmousemove = (e) => {
        const rect = viewport.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
        viewport.classList.add('zoomed');
      };
      viewport.onmouseleave = () => {
        viewport.classList.remove('zoomed');
      };
    }
  }

  // Display first item initially
  displayMedia(mediaItems[0]);

  // Thumbnail click handler
  strip.querySelectorAll('.thumbnail-item').forEach((thumb) => {
    thumb.addEventListener('click', function () {
      strip.querySelectorAll('.thumbnail-item').forEach((t) => t.classList.remove('active'));
      this.classList.add('active');
      const idx = parseInt(this.dataset.index, 10);
      displayMedia(mediaItems[idx]);
    });
  });
}

/**
 * ============================================
 * 2. PRODUCT VARIANTS & PRICE COMPUTATION
 * ============================================
 */
let currentSelectedVariant = null;
let currentQuantity = 1;
let productBasePrice = 0;

function selectedProductQuantity() {
  return currentQuantity;
}

function initVariantSelector(variants, basePrice, onVariantChangeCallback) {
  productBasePrice = basePrice;
  const container = document.getElementById('variantOptionsContainer');
  const priceDisplay = document.getElementById('dynamicProductPrice');
  const stockDisplay = document.getElementById('stockStatusBadge');
  const addBtn = document.getElementById('addToCartBtn');

  if (!container || !variants || variants.length === 0) return;

  // Set default first variant
  currentSelectedVariant = variants[0];

  container.innerHTML = variants
    .map((v, idx) => {
      const isOutOfStock = v.stock_quantity <= 0;
      return `
      <button 
        type="button" 
        class="variant-pill ${idx === 0 && !isOutOfStock ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
        data-variant-id="${v.id}"
        ${isOutOfStock ? 'disabled' : ''}>
        ${v.color} (${v.size}) ${v.price_adjustment > 0 ? `+KES ${v.price_adjustment}` : ''}
      </button>`;
    })
    .join('');

  function updateVariantUI(variant) {
    currentSelectedVariant = variant;
    const unitPrice = productBasePrice + (variant.price_adjustment || 0);
    const totalPrice = unitPrice * currentQuantity;

    if (priceDisplay) {
      priceDisplay.textContent = `KES ${totalPrice.toLocaleString()}`;
    }

    if (stockDisplay) {
      if (variant.stock_quantity <= 0) {
        stockDisplay.innerHTML = '<span style="color:#e74c3c; font-weight:700;">❌ Out of Stock</span>';
        if (addBtn) addBtn.disabled = true;
      } else if (variant.stock_quantity < 10) {
        stockDisplay.innerHTML = `<span style="color:#d35400; font-weight:700;">⚠️ Only ${variant.stock_quantity} left in stock!</span>`;
        if (addBtn) addBtn.disabled = false;
      } else {
        stockDisplay.innerHTML = `<span style="color:#27ae60; font-weight:700;">✅ In Stock (${variant.stock_quantity} units)</span>`;
        if (addBtn) addBtn.disabled = false;
      }
    }

    if (onVariantChangeCallback) {
      onVariantChangeCallback(variant, unitPrice);
    }
  }

  updateVariantUI(currentSelectedVariant);

  container.querySelectorAll('.variant-pill:not(.out-of-stock)').forEach((btn) => {
    btn.addEventListener('click', function () {
      container.querySelectorAll('.variant-pill').forEach((p) => p.classList.remove('active'));
      this.classList.add('active');
      const varId = this.dataset.variantId;
      const found = variants.find((v) => v.id === varId);
      if (found) updateVariantUI(found);
    });
  });
}

/**
 * ============================================
 * 3. QUANTITY STEPPER
 * ============================================
 */
function initQuantityStepper(onQuantityChange) {
  const minusBtn = document.getElementById('stepMinusBtn');
  const plusBtn = document.getElementById('stepPlusBtn');
  const input = document.getElementById('stepperValue');

  if (!minusBtn || !plusBtn || !input) return;

  function setQty(val) {
    const maxStock = currentSelectedVariant ? currentSelectedVariant.stock_quantity : 99;
    currentQuantity = Math.max(1, Math.min(maxStock, val));
    input.value = currentQuantity;

    // Update dynamic price
    const unitPrice = productBasePrice + (currentSelectedVariant?.price_adjustment || 0);
    const priceDisplay = document.getElementById('dynamicProductPrice');
    if (priceDisplay) {
      priceDisplay.textContent = `KES ${(unitPrice * currentQuantity).toLocaleString()}`;
    }

    if (onQuantityChange) onQuantityChange(currentQuantity);
  }

  minusBtn.addEventListener('click', () => setQty(currentQuantity - 1));
  plusBtn.addEventListener('click', () => setQty(currentQuantity + 1));
  input.addEventListener('change', () => setQty(parseInt(input.value, 10) || 1));
}

/**
 * ============================================
 * 4. SAFARICOM M-PESA STK PUSH TRIGGER
 * ============================================
 */
async function triggerMpesaSTKPush(orderId, phoneNumber, onSuccess, onError) {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/mpesa/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : ''
      },
      credentials: 'include',
      body: JSON.stringify({
        order_id: orderId,
        phone_number: phoneNumber
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (onError) onError(data.error || 'Failed to trigger M-Pesa prompt.');
      return;
    }

    // Success response with CheckoutRequestID
    if (onSuccess) onSuccess(data);

    // Poll for payment completion
    if (data.checkout_request_id) {
      pollMpesaStatus(data.checkout_request_id, onSuccess, onError);
    }
  } catch (err) {
    if (onError) onError('Could not connect to M-Pesa payment gateway.');
  }
}

function pollMpesaStatus(checkoutRequestId, onSuccess, onError) {
  let attempts = 0;
  const interval = setInterval(async () => {
    attempts++;
    if (attempts > 12) {
      // 60 seconds timeout
      clearInterval(interval);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/mpesa/status/${checkoutRequestId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.status === 'success') {
        clearInterval(interval);
        if (onSuccess) onSuccess({ paid: true, receipt: data.receipt_number });
      } else if (data.status === 'failed') {
        clearInterval(interval);
        if (onError) onError(data.result_desc || 'M-Pesa transaction was cancelled.');
      }
    } catch (e) {
      // continue polling
    }
  }, 5000);
}

/**
 * ============================================
 * 5. VERTICAL DELIVERY CHECKPOINT TIMELINE
 * ============================================
 */
async function renderTrackingTimeline(orderId, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    container.innerHTML = '<p style="color:#8b6f8a;">⏳ Fetching live checkpoints...</p>';
    const res = await fetch(`${API_BASE}/orders/${orderId}/track`, { credentials: 'include' });
    const data = await res.json();

    if (!res.ok) {
      container.innerHTML = `<p style="color:#e74c3c;">${data.error || 'Could not load tracking data.'}</p>`;
      return;
    }

    const checkpoints = data.checkpoints || [];
    if (checkpoints.length === 0) {
      container.innerHTML = '<p style="color:#8b6f8a;">No checkpoints logged yet. Order is being processed.</p>';
      return;
    }

    container.innerHTML = `
      <div class="timeline">
        ${checkpoints
          .map(
            (c) => `
          <div class="timeline-checkpoint">
            <span class="checkpoint-node"></span>
            <div class="checkpoint-time">📅 ${c.timestamp} · 📍 ${c.location}</div>
            <div class="checkpoint-status">${c.status}</div>
            <div class="checkpoint-desc">${c.description}</div>
          </div>`
          )
          .join('')}
      </div>`;
  } catch (err) {
    container.innerHTML = '<p style="color:#e74c3c;">Failed to load delivery checkpoints.</p>';
  }
}

/**
 * ============================================
 * 6. WISHLIST HEART TOGGLE
 * ============================================
 */
async function toggleWishlistHeart(productId, heartButtonElement) {
  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save items to your wishlist! 💖');
      window.location.href = 'login.html';
      return;
    }

    const res = await fetch(`${API_BASE}/wishlist/${productId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include'
    });

    const data = await res.json();
    if (res.ok) {
      const isSaved = data.is_wishlisted;
      heartButtonElement.classList.toggle('active', isSaved);
      heartButtonElement.textContent = isSaved ? '♥' : '♡';
    }
  } catch (err) {
    console.error('Wishlist error:', err);
  }
}
