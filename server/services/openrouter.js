const { debug, debugError } = require('../utils/debug');
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const buildPrompt = (ingredients) => {
  return `You are a family-friendly recipe assistant. Suggest 3-5 recipes using these ingredients: ${ingredients.join(', ')}.

Return ONLY valid JSON in this exact format:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "image": null,
      "instructions": "Step by step instructions",
      "ingredients": ["ingredient1", "ingredient2"],
      "cookTime": 30,
      "servings": 4,
      "tags": ["kid-friendly", "quick"],
      "nutrition": { "calories": 400, "protein": 25, "carbs": 45, "fat": 10 }
    }
  ]
}

Focus on simple, kid-friendly, family-friendly meals. Include nutrition estimates.`;
};

const suggestRecipes = async (ingredients) => {
  if (!ingredients || ingredients.length === 0) return [];

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    debug('[OpenRouter] API key present:', !!apiKey, 'length:', apiKey?.length);
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [{ role: 'user', content: buildPrompt(ingredients) }],
      }),
    });
    debug('[OpenRouter] Response status:', res.status, res.statusText);

    if (!res.ok) {
      const errorBody = await res.text();
      debugError('[OpenRouter] Error body:', errorBody.slice(0, 500));
      return [];
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    debug('[OpenRouter] Raw content (first 300):', content?.slice(0, 300));

    const parsed = JSON.parse(content);
    debug('[OpenRouter] Parsed recipes count:', parsed.recipes?.length);
    return (parsed.recipes || []).map((recipe) => ({
      ...recipe,
      source: 'ai',
      sourceId: null,
    }));
  } catch (err) {
    console.error('OpenRouter suggestRecipes error:', err.message);
    return [];
  }
};

module.exports = { suggestRecipes };
