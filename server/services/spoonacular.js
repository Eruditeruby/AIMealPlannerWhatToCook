const { debug, debugError } = require('../utils/debug');
const BASE_URL = 'https://api.spoonacular.com/recipes';

// In-memory cache for Spoonacular responses
// Cache expires after 1 hour to balance freshness with API usage
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

const getCacheKey = (type, params) => {
  if (type === 'search') {
    return `search:${params.join(',')}`;
  }
  return `detail:${params}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  debug('[Spoonacular] Cache HIT:', key);
  return cached.data;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  debug('[Spoonacular] Cache SET:', key);
};

const findByIngredients = async (ingredients) => {
  if (!ingredients || ingredients.length === 0) return [];

  // Check cache first
  const cacheKey = getCacheKey('search', ingredients);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    debug('[Spoonacular] API key present:', !!apiKey);
    const url = `${BASE_URL}/findByIngredients?ingredients=${ingredients.join(',')}&number=10&ranking=1&apiKey=${apiKey}`;
    debug('[Spoonacular] Request URL (no key):', url.replace(apiKey || '', '***'));
    const res = await fetch(url, { method: 'GET' });
    debug('[Spoonacular] Response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorBody = await res.text();
      debugError('[Spoonacular] Error body:', errorBody.slice(0, 300));
      return [];
    }

    const data = await res.json();
    debug('[Spoonacular] Results count:', data.length);
    const results = data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients?.map((i) => i.name) || [],
      missedIngredients: recipe.missedIngredients?.map((i) => i.name) || [],
    }));

    // Cache the results
    setCache(cacheKey, results);
    return results;
  } catch (err) {
    console.error('Spoonacular findByIngredients error:', err.message);
    return [];
  }
};

const getRecipeDetails = async (id) => {
  // Check cache first
  const cacheKey = getCacheKey('detail', id);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/${id}/information?includeNutrition=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) return null;

    const data = await res.json();
    const nutrients = data.nutrition?.nutrients || [];
    const findNutrient = (name) => nutrients.find((n) => n.name === name)?.amount || null;

    const result = {
      id: data.id,
      title: data.title,
      image: data.image,
      instructions: data.instructions || '',
      cookTime: data.readyInMinutes || null,
      servings: data.servings || null,
      ingredients: (data.extendedIngredients || []).map((i) => i.original),
      nutrition: {
        calories: findNutrient('Calories'),
        protein: findNutrient('Protein'),
        carbs: findNutrient('Carbohydrates'),
        fat: findNutrient('Fat'),
      },
    };

    // Cache the result
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('Spoonacular getRecipeDetails error:', err.message);
    return null;
  }
};

module.exports = { findByIngredients, getRecipeDetails };
