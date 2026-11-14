// routes/reviews.js - Customer Reviews API Routes
const express = require('express');
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { readReviews, addReview } = require('../utils/reviewsDb');
const { sanitizeHtml, validateInteger } = require('../middleware/security');

const router = express.Router();

/**
 * GET /api/reviews - Public or Authenticated fetch of all approved reviews
 */
router.get('/', async (req, res) => {
  try {
    const reviews = await readReviews();
    return res.status(200).json({
      success: true,
      reviews
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ error: 'Failed to retrieve reviews.' });
  }
});

/**
 * GET /api/reviews/my - (Protected) Get logged in user's reviews
 */
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const userEmail = req.user.email;
    const all = await readReviews();
    const myReviews = all.filter(
      (r) => r.user_id === userId || (r.email && r.email.toLowerCase() === userEmail.toLowerCase())
    );
    return res.status(200).json({ reviews: myReviews });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve user reviews.' });
  }
});

/**
 * POST /api/reviews - (Protected) Post a new review
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const rating = parseInt(req.body.rating, 10);
    const comment = (req.body.comment || '').trim();
    const location = (req.body.location || req.user.location || 'Nairobi, Kenya').trim();
    const name = (req.body.name || req.user.name || 'Gleam Girl').trim();

    if (!validateInteger(rating, 1, 5)) {
      return res.status(400).json({ error: 'Please select a star rating between 1 and 5.' });
    }

    if (!comment || comment.length < 5) {
      return res.status(400).json({ error: 'Please write a review of at least 5 characters.' });
    }

    // Sanitize user input to prevent XSS
    const sanitizedComment = sanitizeHtml(comment.slice(0, 600));
    const sanitizedName = sanitizeHtml(name.slice(0, 60));
    const sanitizedLocation = sanitizeHtml(location.slice(0, 80));

    const newReview = {
      id: `rev_${crypto.randomUUID()}`,
      user_id: req.user.sub || req.user.id,
      name: sanitizedName,
      location: sanitizedLocation,
      rating,
      comment: sanitizedComment,
      createdAt: new Date().toISOString()
    };

    await addReview(newReview);

    return res.status(201).json({
      message: 'Review posted successfully! Thank you for the love ✨',
      review: newReview
    });
  } catch (err) {
    console.error('Error posting review:', err);
    return res.status(500).json({ error: 'Failed to post review.' });
  }
});

module.exports = router;
