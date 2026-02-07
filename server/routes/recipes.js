const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const spoonacular = require('../services/spoonacular');
const openrouter = require('../services/openrouter');
const SavedRecipe = require('../models/SavedRecipe');

const MIN_SPOONACULAR_RESULTS = 3;

// GET /api/recipes/suggest?ingredients=chicken,rice
router.get('/suggest', authMiddleware, async (req, res) => {
  try {
    const { ingredients } = req.query;
    console.log('[/suggest] ingredients query:', ingredients);
    console.log('[/suggest] user:', req.user?.userId);
    if (!ingredients) {
      return res.status(400).json({ error: 'ingredients query param required' });
    }

    const ingredientList = ingredients.split(',').map((i) => i.trim()).filter(Boolean);
    console.log('[/suggest] ingredientList:', ingredientList);

    let spoonResults = await spoonacular.findByIngredients(ingredientList);
    console.log('[/suggest] spoonacular results:', spoonResults.length);
    spoonResults = spoonResults.map((r) => ({ ...r, source: 'spoonacular' }));

    let aiResults = [];
    if (spoonResults.length < MIN_SPOONACULAR_RESULTS) {
      console.log('[/suggest] spoonacular < 3, calling OpenRouter...');
      aiResults = await openrouter.suggestRecipes(ingredientList);
      console.log('[/suggest] OpenRouter results:', aiResults.length);
    }

    const recipes = [...spoonResults, ...aiResults];
    console.log('[/suggest] total recipes:', recipes.length);
    res.json({ recipes });
  } catch (err) {
    console.error('[/suggest] ERROR:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes/:id
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const recipes = await SavedRecipe.find({ userId: req.user.userId }).sort({ savedAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recipes/saved
router.post('/saved', authMiddleware, async (req, res) => {
  try {
    const { title, source, ingredients } = req.body;
    console.log('[POST /saved] user:', req.user?.userId);
    console.log('[POST /saved] body:', JSON.stringify(req.body).slice(0, 500));
    if (!title || !source || !ingredients) {
      console.log('[POST /saved] Missing fields - title:', !!title, 'source:', !!source, 'ingredients:', !!ingredients);
      return res.status(400).json({ error: 'title, source, and ingredients are required' });
    }

    const recipe = await SavedRecipe.create({
      userId: req.user.userId,
      ...req.body,
    });
    console.log('[POST /saved] Created recipe:', recipe._id);
    res.status(201).json(recipe);
  } catch (err) {
    console.error('[POST /saved] ERROR:', err.message, err.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/recipes/saved/:id
router.delete('/saved/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await SavedRecipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe removed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recipes/:id (Spoonacular detail)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const recipe = await spoonacular.getRecipeDetails(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
