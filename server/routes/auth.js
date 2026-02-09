const express = require('express');
const passport = require('passport');
const router = express.Router();
const { debug, debugError } = require('../utils/debug');
const authMiddleware = require('../middleware/auth');
const { generateToken } = require('../utils/token');
const User = require('../models/User');

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  debug('[Auth] Google OAuth initiated');
  debug('[Auth] GOOGLE_CLIENT_ID set:', !!process.env.GOOGLE_CLIENT_ID);
  debug('[Auth] GOOGLE_CLIENT_SECRET set:', !!process.env.GOOGLE_CLIENT_SECRET);
  debug('[Auth] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    debug('[Auth] Google callback received');
    debug('[Auth] Query params:', JSON.stringify(req.query));
    passport.authenticate('google', { session: false }, (err, user, info) => {
      if (err) {
        debugError('[Auth] Passport error:', err.message);
        return res.redirect((process.env.CLIENT_URL || 'http://localhost:3000') + '?error=auth_error');
      }
      if (!user) {
        debugError('[Auth] No user returned. Info:', JSON.stringify(info));
        return res.redirect((process.env.CLIENT_URL || 'http://localhost:3000') + '?error=no_user');
      }
      debug('[Auth] User authenticated:', user.email);
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = generateToken(req.user);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    debug('[Auth] Setting cookie. Secure:', cookieOptions.secure, 'SameSite:', cookieOptions.sameSite);
    debug('[Auth] Redirecting to:', process.env.CLIENT_URL || 'http://localhost:3000');
    res.cookie('token', token, cookieOptions);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    debug('[Auth] /me called, userId:', req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user) {
      debug('[Auth] /me user not found for id:', req.user.userId);
      return res.status(404).json({ error: 'User not found' });
    }
    debug('[Auth] /me returning user:', user.email);
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      preferences: user.preferences,
    });
  } catch (err) {
    debugError('[Auth] /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    debug('[Auth] GET /preferences, userId:', req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ preferences: user.preferences });
  } catch (err) {
    debugError('[Auth] GET /preferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', authMiddleware, async (req, res) => {
  try {
    debug('[Auth] PUT /preferences, userId:', req.user.userId);
    const allowedFields = [
      'dietaryRestrictions',
      'familySize',
      'budgetGoal',
      'cookingSkill',
      'householdType',
      'onboardingComplete',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[`preferences.${field}`] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid preference fields provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    debug('[Auth] Preferences updated for:', user.email);
    res.json({ preferences: user.preferences });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    debugError('[Auth] PUT /preferences error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  debug('[Auth] Logout');
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ message: 'Logged out' });
});

module.exports = router;
