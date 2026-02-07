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
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=true' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferences: user.preferences,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
});

module.exports = router;
