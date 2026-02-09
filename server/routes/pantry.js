const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Pantry = require('../models/Pantry');
const { getIngredientMeta } = require('../data/ingredientMeta');

// GET /api/pantry
router.get('/', authMiddleware, async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.user.userId });
    if (!pantry) {
      return res.json({ items: [], pantryItems: [], updatedAt: null });
    }
    res.json({
      items: pantry.items.map((i) => i.name),
      pantryItems: pantry.items,
      updatedAt: pantry.updatedAt,
    });
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

    if (items.length > 500) {
      return res.status(400).json({ error: 'Maximum 500 items allowed' });
    }

    if (!items.every((item) => typeof item === 'string' && item.length <= 100)) {
      return res.status(400).json({ error: 'All items must be strings (max 100 characters)' });
    }

    // Normalize: trim, lowercase, deduplicate
    const uniqueNames = [...new Set(items.map((item) => item.trim().toLowerCase()))];

    // Get existing pantry to preserve addedAt dates for existing items
    const existing = await Pantry.findOne({ userId: req.user.userId });
    const existingMap = new Map();
    if (existing) {
      for (const item of existing.items) {
        existingMap.set(item.name, item);
      }
    }

    // Build enriched items, preserving addedAt for items that already exist
    const enrichedItems = uniqueNames.map((name) => {
      const prev = existingMap.get(name);
      const meta = getIngredientMeta(name);
      return {
        name,
        addedAt: prev ? prev.addedAt : new Date(),
        category: meta.category,
        perishable: meta.perishable,
      };
    });

    const pantry = await Pantry.findOneAndUpdate(
      { userId: req.user.userId },
      { items: enrichedItems },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      items: pantry.items.map((i) => i.name),
      pantryItems: pantry.items,
      updatedAt: pantry.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
