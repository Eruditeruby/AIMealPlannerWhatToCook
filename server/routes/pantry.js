const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Pantry = require('../models/Pantry');

// GET /api/pantry
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.user.userId });
    if (!pantry) {
      return res.json({ items: [], updatedAt: null });
    }
    res.json({ items: pantry.items, updatedAt: pantry.updatedAt });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/pantry
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }

    if (!items.every((item) => typeof item === 'string')) {
      return res.status(400).json({ error: 'All items must be strings' });
    }

    // Normalize: trim, lowercase, deduplicate
    const normalized = [...new Set(items.map((item) => item.trim().toLowerCase()))];

    const pantry = await Pantry.findOneAndUpdate(
      { userId: req.user.userId },
      { items: normalized },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ items: pantry.items, updatedAt: pantry.updatedAt });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
