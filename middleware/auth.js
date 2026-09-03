// middleware/auth.js - JWT Authentication & Authorization
const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'agg_session';
const JWT_SECRET = process.env.JWT_SECRET || 'e7b4cf8291a56f082e6c43912da0781e9f1a23847db38a7c54129b08f45a6c1e92a8374d6f8019e34c2b9a78de5412cf';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

function signSession(user) {
  return jwt.sign(
    {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || (user.is_admin ? 'admin' : 'customer'),
      isAdmin: Boolean(user.is_admin || user.role === 'admin')
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifySession(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function getSessionFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const decoded = verifySession(token);
    if (decoded) return decoded;
  }

  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) {
    const decoded = verifySession(cookieToken);
    if (decoded) return decoded;
  }

  return null;
}

function requireAuth(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) {
    if ((req.headers.accept || '').includes('text/html')) {
      return res.redirect(`/login.html?redirect=${encodeURIComponent(req.originalUrl)}`);
    }
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  req.user = session;
  next();
}

function requireAdmin(req, res, next) {
  const session = getSessionFromRequest(req);
  if (!session) return res.status(401).json({ error: 'Authentication required.' });
  if (!session.isAdmin && session.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  req.user = session;
  next();
}

module.exports = {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  signSession,
  verifySession,
  getSessionFromRequest,
  requireAuth,
  requireAdmin
};