// Review storage. DATABASE_URL enables PostgreSQL; otherwise use local JSON.
const fs = require('fs');
const path = require('path');
const { isPostgresEnabled, listRecords, mutateRecords } = require('./pgStore');

const DB_PATH = path.join(__dirname, '..', 'data', 'reviews.json');

const DEFAULT_REVIEWS = [
  {
    id: 'rev_1', user_id: 'usr_1', name: 'Wanjiku', location: 'Nairobi', rating: 5,
    comment: 'The pimple patches are SO cute and actually work wonders overnight! Delivery was speedy and packaging was pink & adorable 💖',
    createdAt: '2026-08-25T14:20:00.000Z'
  },
  {
    id: 'rev_2', user_id: 'usr_2', name: 'Faith A.', location: 'Kasarani', rating: 5,
    comment: 'My baddie shoulder bag is gorgeous! The quality is way better than expected and it goes with everything.',
    createdAt: '2026-08-27T09:15:00.000Z'
  },
  {
    id: 'rev_3', user_id: 'usr_3', name: 'Aisha M.', location: 'Mombasa', rating: 5,
    comment: 'Affordable, pretty, and exactly like the photos. Aesthetic Girly Gleam never misses! ✨',
    createdAt: '2026-08-29T16:45:00.000Z'
  }
];

function readLocalReviews() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeLocalReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    const reviews = JSON.parse(fs.readFileSync(DB_PATH, 'utf8') || '[]');
    if (reviews.length === 0) {
      writeLocalReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    return reviews;
  } catch (error) {
    if (error.code === 'ENOENT') {
      writeLocalReviews(DEFAULT_REVIEWS);
      return DEFAULT_REVIEWS;
    }
    console.error('Unable to read reviews:', error);
    return [];
  }
}

function writeLocalReviews(reviews) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(reviews, null, 2));
}

async function readReviews() {
  return isPostgresEnabled() ? listRecords('reviews') : readLocalReviews();
}

async function writeReviews(reviews) {
  if (isPostgresEnabled()) return mutateRecords('reviews', (records) => records.splice(0, records.length, ...reviews));
  writeLocalReviews(reviews);
}

async function addReview(review) {
  if (isPostgresEnabled()) return mutateRecords('reviews', (reviews) => { reviews.unshift(review); return review; });
  const reviews = readLocalReviews();
  reviews.unshift(review);
  writeLocalReviews(reviews);
  return review;
}

module.exports = { DEFAULT_REVIEWS, readReviews, writeReviews, addReview };
