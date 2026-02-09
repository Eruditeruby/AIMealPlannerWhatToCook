const express = require('express');
const router = express.Router();
const { debug, debugError } = require('../utils/debug');
const authMiddleware = require('../middleware/auth');
const CookingLog = require('../models/CookingLog');

const ESTIMATED_SAVINGS_PER_MEAL = 5; // $8 takeout - $3 home cooking

// POST /api/cooking/log
router.post('/log', authMiddleware, async (req, res) => {
  try {
    const { recipeTitle, ingredientsUsed } = req.body;
    debug('[POST /cooking/log] user:', req.user?.userId);

    if (!recipeTitle || !ingredientsUsed || !ingredientsUsed.length) {
      return res.status(400).json({ error: 'recipeTitle and ingredientsUsed are required' });
    }

    const log = await CookingLog.create({
      userId: req.user.userId,
      recipeTitle,
      ingredientsUsed,
      estimatedSavings: ESTIMATED_SAVINGS_PER_MEAL,
    });

    debug('[POST /cooking/log] created:', log._id);
    res.status(201).json(log);
  } catch (err) {
    debugError('[POST /cooking/log] ERROR:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cooking/history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const logs = await CookingLog.find({ userId: req.user.userId }).sort({ cookedAt: -1 });
    res.json(logs);
  } catch (err) {
    debugError('[GET /cooking/history] ERROR:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cooking/savings
router.get('/savings', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allLogs = await CookingLog.find({ userId: req.user.userId });

    let weekly = 0;
    let monthly = 0;
    let total = 0;

    for (const log of allLogs) {
      total += log.estimatedSavings;
      if (log.cookedAt >= startOfMonth) monthly += log.estimatedSavings;
      if (log.cookedAt >= startOfWeek) weekly += log.estimatedSavings;
    }

    res.json({
      weekly,
      monthly,
      total,
      mealsCooked: allLogs.length,
    });
  } catch (err) {
    debugError('[GET /cooking/savings] ERROR:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
