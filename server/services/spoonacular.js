const BASE_URL = 'https://api.spoonacular.com/recipes';

const findByIngredients = async (ingredients) => {
  if (!ingredients || ingredients.length === 0) return [];

  try {
    const url = `${BASE_URL}/findByIngredients?ingredients=${ingredients.join(',')}&number=10&ranking=1&apiKey=${process.env.SPOONACULAR_API_KEY}`;
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) return [];

    const data = await res.json();
    return data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients?.map((i) => i.name) || [],
      missedIngredients: recipe.missedIngredients?.map((i) => i.name) || [],
    }));
  } catch (err) {
    console.error('Spoonacular findByIngredients error:', err.message);
    return [];
  }
};

const getRecipeDetails = async (id) => {
  try {
    const url = `${BASE_URL}/${id}/information?includeNutrition=true&apiKey=${process.env.SPOONACULAR_API_KEY}`;
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) return null;

    const data = await res.json();
    const nutrients = data.nutrition?.nutrients || [];
    const findNutrient = (name) => nutrients.find((n) => n.name === name)?.amount || null;

    return {
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
  } catch (err) {
    console.error('Spoonacular getRecipeDetails error:', err.message);
    return null;
  }
};

module.exports = { findByIngredients, getRecipeDetails };
