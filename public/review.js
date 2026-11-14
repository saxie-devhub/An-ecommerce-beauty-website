// reviews.js - Complete Working Version
const API_BASE = `${window.location.origin}/api`;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Reviews page loaded');

    // ============================================
    // CHECK LOGIN STATUS
    // ============================================
    const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
    const token = localStorage.getItem('access_token');

    // ============================================
    // LOAD REVIEWS
    // ============================================
    async function loadReviews() {
        try {
            const response = await fetch(`${API_BASE}/reviews`);
            if (!response.ok) throw new Error('Failed to load reviews');
            const data = await response.json();
            renderReviews(data.reviews || []);
        } catch (error) {
            console.error('Error loading reviews:', error);
            document.getElementById('communityReviews').innerHTML = `
                <p style="text-align:center;color:#8b6f8a;">Could not load reviews. Please try again.</p>
            `;
        }
    }

    function renderReviews(reviews) {
        const container = document.getElementById('communityReviews');
        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:#8b6f8a;">
                    <span style="font-size:3rem;display:block;">📝</span>
                    <h3>No reviews yet</h3>
                    <p>Be the first to share your experience!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reviews.map(review => `
            <div style="background:#fff;border-radius:16px;padding:20px;box-shadow:0 4px 12px rgba(75,23,79,0.08);margin-bottom:16px;">
                <div style="color:#f5a623;font-size:1.1rem;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p style="margin:8px 0;color:#4b174f;line-height:1.6;">${review.comment}</p>
                ${review.photo_url ? `<img src="${review.photo_url}" style="max-width:100%;max-height:200px;border-radius:12px;margin-top:8px;" />` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:#8b6f8a;margin-top:8px;">
                    <span><strong>${review.name || review.user_name || 'Anonymous'}</strong>${review.location ? ` · ${review.location}` : ''}</span>
                    <span>${(review.createdAt || review.created_at) ? new Date(review.createdAt || review.created_at).toLocaleDateString() : ''}</span>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // SUBMIT REVIEW
    // ============================================
    const form = document.getElementById('reviewForm');
    if (form) {
        // Star rating
        const stars = document.querySelectorAll('.star');
        const ratingInput = document.getElementById('ratingValue');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.dataset.value);
                ratingInput.value = value;
                stars.forEach(s => {
                    s.classList.toggle('filled', parseInt(s.dataset.value) <= value);
                });
            });
        });

        // Photo preview
        const photoInput = document.getElementById('reviewPhoto');
        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        const removePhoto = document.getElementById('removePhoto');

        if (photoInput) {
            photoInput.addEventListener('change', function() {
                const file = this.files[0];
                if (!file) return;
                
                if (!file.type.startsWith('image/')) {
                    alert('Please upload an image file.');
                    this.value = '';
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image must be under 5MB.');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    photoPreviewImg.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            });
        }

        if (removePhoto) {
            removePhoto.addEventListener('click', function() {
                photoInput.value = '';
                photoPreview.style.display = 'none';
                photoPreviewImg.src = '';
            });
        }

        // Submit review
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('access_token');
            const user = JSON.parse(localStorage.getItem('agg_user') || 'null');
            
            if (!token || !user) {
                alert('⚠️ Please login first to submit a review.');
                window.location.href = '/login.html?redirect=/reviews.html';
                return;
            }
            
            const rating = parseInt(ratingInput.value);
            const comment = document.getElementById('reviewComment').value.trim();
            const status = document.getElementById('reviewStatus');
            const submitBtn = document.getElementById('submitReviewBtn');
            const reviewerName = document.getElementById('reviewerName');
            const reviewerLocation = document.getElementById('reviewerLocation');
            
            if (!rating || rating < 1 || rating > 5) {
                status.textContent = '⚠️ Please select a star rating.';
                status.className = 'review-status error';
                return;
            }
            
            if (!comment || comment.length < 5) {
                status.textContent = '⚠️ Please write at least a few words.';
                status.className = 'review-status error';
                return;
            }
            
            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '⏳ Submitting...'; }
            status.textContent = '';
            status.className = 'review-status';
            
            try {
                // Submit review
                const response = await fetch(`${API_BASE}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        rating: rating,
                        comment: comment,
                        name: reviewerName?.value.trim() || user.name || '',
                        location: reviewerLocation?.value.trim() || user.location || ''
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    status.textContent = data.error || '❌ Failed to submit review.';
                    status.className = 'review-status error';
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Post My Review ✨'; }
                    return;
                }
                
                status.textContent = '✅ Review submitted successfully! Thank you! ✨';
                status.className = 'review-status success';
                form.reset();
                stars.forEach(s => s.classList.remove('filled'));
                ratingInput.value = 0;
                if (photoPreview) photoPreview.style.display = 'none';
                if (photoPreviewImg) photoPreviewImg.src = '';
                
                // Reload reviews
                loadReviews();
                
            } catch (error) {
                console.error('Submit review error:', error);
                status.textContent = '❌ Could not connect to server. Please try again.';
                status.className = 'review-status error';
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = 'Post My Review ✨'; }
            }
        });
    }

    // ============================================
    // INITIALIZE
    // ============================================
    loadReviews();
});
