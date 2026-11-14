// server.js - Aesthetic Girly Gleam Main Server
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');
const mpesaRoutes = require('./routes/mpesa');

const { requireAuth, requireAdmin } = require('./middleware/auth');
const { sanitizeInputMiddleware } = require('./middleware/security');
const { readUsers, updateUserProfile } = require('./utils/db');
const { initializeStorage, isPostgresEnabled } = require('./utils/pgStore');

const app = express();
const PUBLIC_DIR = path.join(__dirname, 'public');

app.disable('x-powered-by');

// Security Headers
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS (Allow Live Server port 5500 & dev ports)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://localhost:5000'
].join(',')).split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Origin is not allowed by CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInputMiddleware);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mpesa', mpesaRoutes);

// Admin User Management Endpoints
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = (await readUsers()).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role || (u.is_admin ? 'admin' : 'customer'),
      is_admin: u.is_admin || (u.role === 'admin' ? 1 : 0),
      created_at: u.createdAt || u.created_at || new Date().toISOString()
    }));
    return res.json({ users });
  } catch (error) {
    console.error('Unable to read users:', error);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

app.put('/api/users/:id/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body || {};
    const newRole = role === 'admin' ? 'admin' : 'customer';
    const updatedUser = await updateUserProfile(req.params.id, {
      role: newRole,
      is_admin: newRole === 'admin' ? 1 : 0
    });

    if (!updatedUser) return res.status(404).json({ error: 'User not found.' });

    return res.json({
      message: `User role updated to ${newRole}!`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        is_admin: updatedUser.is_admin
      }
    });
  } catch (error) {
    console.error('Unable to update user role:', error);
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
});

app.get('/api/health', (req, res) => res.json({
  status: 'online',
  store: 'Aesthetic Girly Gleam',
  database: isPostgresEnabled() ? 'postgres' : 'local-json'
}));

// Static Files & Pages
app.get('/', (req, res) => res.redirect('/home.html'));
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

const PORT = process.env.PORT || 5000;
initializeStorage()
  .then(({ backend }) => {
    app.listen(PORT, () => {
      console.log(`✨ Server running at http://localhost:${PORT}`);
      console.log(`🗄️ Data storage: ${backend}`);
      console.log(`🔗 Allowed CORS origins: ${allowedOrigins.join(', ') || 'same-origin only'}`);
    });
  })
  .catch((error) => {
    console.error('Storage initialization failed:', error);
    process.exit(1);
  });
