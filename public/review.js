// public/review.js - Dynamic Reviews Loader & Star Rating Form
const API_BASE = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ Reviews Feed Initialized');

  let currentRating = 5;
  const stars = document.querySelectorAll('#starRating .star');
  const ratingInput = document.getElementById('ratingValue');
  const statusDiv = document.getElementById('reviewStatus');
  const submitBtn = document.getElementById('submitReviewBtn');
  const container = document.getElementById('communityReviews');
  const countBadge = document.getElementById('totalReviewsCount');

  // 1. Star Rating Selector
  function updateStars(rating) {
    currentRating = rating;
    if (ratingInput) ratingInput.value = rating;

    stars.forEach((star) => {
      const val = parseInt(star.dataset.value, 10);
      if (val <= rating) star.classList.add('filled');
      else star.classList.remove('filled');
    });
  }

  stars.forEach((star) => {
    star.addEventListener('click', function () {
      updateStars(parseInt(this.dataset.value, 10));
    });
  });
  updateStars(5);

  // 2. Fetch Reviews from Backend
  async function loadReviews() {
    if (!container) return;
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const reviews = data.reviews || [];

      if (countBadge) countBadge.textContent = reviews.length;

      if (reviews.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding: 40px; background:#fff; border-radius:20px; border:1px solid #f9e2f3;">
            <span style="font-size:3rem; display:block;">💖</span>
            <p style="color:#8b6f8a;">No reviews yet. Be the first to review!</p>
          </div>`;
        return;
      }

      container.innerHTML = reviews
        .map((r) => {
          const starCount = Math.max(1, Math.min(5, Number(r.rating) || 5));
          return `
          <article class="review-card">
            <div class="stars">${'★'.repeat(starCount)}${'☆'.repeat(5 - starCount)}</div>
            <p>“${r.comment}”</p>
            <div class="review-meta">
              <span><strong>${r.name || 'Gleam Girl'}</strong> · 📍 ${r.location || 'Nairobi, Kenya'}</span>
              <small>📅 ${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</small>
            </div>
          </article>`;
        })
        .join('');
    } catch (err) {
      console.error('Reviews load error:', err);
      container.innerHTML = '<p style="text-align:center; color:#e74c3c;">Could not load reviews. Backend running on port 5000?</p>';
    }
  }

  // 3. Post Review Submission
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const comment = document.getElementById('reviewComment')?.value.trim();
      const name = document.getElementById('reviewerName')?.value.trim();
      const location = document.getElementById('reviewerLocation')?.value.trim();

      if (!comment || comment.length < 5) {
        showStatus('⚠️ Please write at least 5 characters.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = '⏳ Posting...';

      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/reviews`, {
          method: 'POST',
          headers,
          credentials: 'include',
          body: JSON.stringify({
            rating: currentRating,
            comment,
            name: name || 'Gleam Girl',
            location: location || 'Nairobi, Kenya'
          })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (res.status === 401) {
            showStatus('🔒 Please log in first to submit a review.', 'error');
            setTimeout(() => { window.location.href = 'login.html?redirect=/reviews.html'; }, 1500);
            return;
          }
          showStatus(data.error || 'Failed to submit review.', 'error');
          return;
        }

        showStatus('✨ Review posted successfully!', 'success');
        document.getElementById('reviewComment').value = '';
        loadReviews();
      } catch (e) {
        showStatus('❌ Connection error to server.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post My Review ✨';
      }
    });
  }

  function showStatus(msg, type) {
    if (!statusDiv) return;
    statusDiv.textContent = msg;
    statusDiv.className = `review-status ${type}`;
    statusDiv.style.display = 'block';
  }

  loadReviews();
});
