// routes/auth.js - Authentication & Profile API Routes
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const { findUserByEmail, findUserById, createUser, updateUserProfile } = require('../utils/db');
const {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  signSession,
  requireAuth
} = require('../middleware/auth');
const { sanitizeHtml, validateEmail, validatePassword } = require('../middleware/security');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});

/**
 * POST /api/auth/signup
 */
router.post('/signup', authLimiter, (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (min 2 characters).' });
    }
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!password || !validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (findUserByEmail(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const user = {
      id: crypto.randomUUID(),
      name: sanitizeHtml(name.trim()),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 12),
      bio: '✨ Small details, major sparkle ✨',
      location: '',
      phone: '',
      avatar: '',
      role: 'customer',
      is_admin: 0,
      createdAt: new Date().toISOString()
    };

    createUser(user);

    const token = signSession(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'Account created successfully!',
      access_token: token,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', authLimiter, (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = findUserByEmail(cleanEmail);
    const genericError = { error: 'Incorrect email or password.' };

    if (!user || !user.passwordHash) {
      return res.status(401).json(genericError);
    }

    const matches = bcrypt.compareSync(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json(genericError);
    }

    const token = signSession(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(200).json({
      message: 'Login successful!',
      access_token: token,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio || '✨ Small details, major sparkle ✨',
        location: user.location || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role || (user.is_admin ? 'admin' : 'customer'),
        is_admin: user.is_admin || (user.role === 'admin' ? 1 : 0)
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

/**
 * GET /api/auth/me (Protected)
 */
router.get('/me', requireAuth, (req, res) => {
  const user = findUserById(req.user.sub || req.user.id) || req.user;
  res.json({
    user: {
      id: user.id || user.sub,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      avatar: user.avatar || '',
      role: user.role || 'customer',
      is_admin: user.is_admin || (user.role === 'admin' ? 1 : 0)
    }
  });
});

/**
 * PUT /api/auth/profile (Protected)
 */
router.put('/profile', requireAuth, (req, res) => {
  try {
    const userId = req.user.sub || req.user.id;
    const { name, bio, location, phone, avatar } = req.body || {};

    const updates = {};
    if (name) updates.name = sanitizeHtml(name.trim());
    if (bio !== undefined) updates.bio = sanitizeHtml(bio.trim());
    if (location !== undefined) updates.location = sanitizeHtml(location.trim());
    if (phone !== undefined) updates.phone = sanitizeHtml(phone.trim());
    if (avatar !== undefined) updates.avatar = avatar;

    const updatedUser = updateUserProfile(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        location: updatedUser.location,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        is_admin: updatedUser.is_admin
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(200).json({ ok: true, message: 'Logged out successfully.' });
});

module.exports = router;