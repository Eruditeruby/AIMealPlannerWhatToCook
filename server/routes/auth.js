const express = require('express');
const passport = require('passport');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { generateToken } = require('../utils/token');
const User = require('../models/User');

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  console.log('[Auth] Google OAuth initiated');
  console.log('[Auth] GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('[Auth] GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('[Auth] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('[Auth] Google callback received');
    console.log('[Auth] Query params:', JSON.stringify(req.query));
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        console.error('[Auth] Passport error:', err.message);
        return res.redirect((process.env.CLIENT_URL || 'http://localhost:3000') + '?error=auth_error');
      }
      if (!user) {
        console.error('[Auth] No user returned. Info:', JSON.stringify(info));
        return res.redirect((process.env.CLIENT_URL || 'http://localhost:3000') + '?error=no_user');
      }
      console.log('[Auth] User authenticated:', user.email);
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    console.log('[Auth] Setting cookie. Secure:', cookieOptions.secure, 'SameSite:', cookieOptions.sameSite);
    console.log('[Auth] Redirecting to:', process.env.CLIENT_URL || 'http://localhost:3000');
    res.cookie('token', token, cookieOptions);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log('[Auth] /me called, userId:', req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('[Auth] /me user not found for id:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('[Auth] /me returning user:', user.email);
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferences: user.preferences,
    });
  } catch (err) {
    console.error('[Auth] /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('[Auth] Logout');
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
});

module.exports = router;
