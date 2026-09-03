// utils/reviewsDb.js - Reviews Storage
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'reviews.json');

const DEFAULT_REVIEWS = [
  {
    id: 'rev_1',
    user_id: 'usr_1',
    name: 'Wanjiku',
    location: 'Nairobi',
    rating: 5,
    comment: 'The pimple patches are SO cute and actually work wonders overnight! Delivery was speedy and packaging was pink & adorable 💖',
    createdAt: '2026-08-25T14:20:00.000Z'
  },
  {
    id: 'rev_2',
    user_id: 'usr_2',
    name: 'Faith A.',
    location: 'Kasarani',
    rating: 5,
    comment: 'My baddie shoulder bag is gorgeous! The quality is way better than expected and it goes with everything.',
    createdAt: '2026-08-27T09:15:00.000Z'
  },
  {
    id: 'rev_3',
    user_id: 'usr_3',
    name: 'Aisha M.',
    location: 'Mombasa',
    rating: 5,
    comment: 'Affordable, pretty, and exactly like the photos. Aesthetic Girly Gleam never misses! ✨',
    createdAt: '2026-08-29T16:45:00.000Z'
  }
];

function readReviews() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw || '[]');
    if (data.length === 0) {
      writeReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    return data;
  } catch (err) {
    if (err.code === 'ENOENT') {
      writeReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    return DEFAULT_REVIEWS;
  }
}

function writeReviews(reviews) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(reviews, null, 2));
}

function addReview(review) {
  const reviews = readReviews();
  reviews.unshift(review);
  writeReviews(reviews);
  return review;
}

module.exports = { readReviews, writeReviews, addReview };