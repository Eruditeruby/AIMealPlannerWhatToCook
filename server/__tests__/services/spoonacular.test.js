process.env.SPOONACULAR_API_KEY = 'test-api-key';

// Mock global fetch
global.fetch = jest.fn();

const spoonacular = require('../../services/spoonacular');

afterEach(() => {
  jest.resetAllMocks();
});

describe('Spoonacular Client', () => {
  describe('findByIngredients', () => {
    test('calls correct Spoonacular URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await spoonacular.findByIngredients(['chicken', 'rice']);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('findByIngredients'),
        expect.any(Object)
      );
      expect(global.fetch.mock.calls[0][0]).toContain('chicken,rice');
    });

    test('returns normalized recipe array', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: 123,
            title: 'Chicken Rice',
            image: 'https://img.com/cr.jpg',
            usedIngredients: [{ name: 'chicken' }],
            missedIngredients: [{ name: 'soy sauce' }],
          },
        ],
      });

      const results = await spoonacular.findByIngredients(['chicken', 'rice']);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(
        expect.objectContaining({
          id: 123,
          title: 'Chicken Rice',
          image: 'https://img.com/cr.jpg',
        })
      );
    });

    test('handles API error gracefully', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      const results = await spoonacular.findByIngredients(['chicken']);
      expect(results).toEqual([]);
    });

    test('handles rate limit (402) gracefully', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 402 });
      const results = await spoonacular.findByIngredients(['chicken']);
      expect(results).toEqual([]);
    });

    test('handles empty ingredients list', async () => {
      const results = await spoonacular.findByIngredients([]);
      expect(results).toEqual([]);
    });
  });

  describe('getRecipeDetails', () => {
    test('returns full recipe details', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 123,
          title: 'Chicken Rice',
          image: 'https://img.com/cr.jpg',
          instructions: 'Cook it.',
          readyInMinutes: 30,
          servings: 4,
          extendedIngredients: [{ original: '1 cup rice' }],
          nutrition: {
            nutrients: [
              { name: 'Calories', amount: 450 },
              { name: 'Protein', amount: 30 },
              { name: 'Carbohydrates', amount: 50 },
              { name: 'Fat', amount: 12 },
            ],
          },
        }),
      });

      const recipe = await spoonacular.getRecipeDetails(123);
      expect(recipe.title).toBe('Chicken Rice');
      expect(recipe.instructions).toBe('Cook it.');
      expect(recipe.cookTime).toBe(30);
      expect(recipe.servings).toBe(4);
      expect(recipe.nutrition.calories).toBe(450);
    });

    test('handles API error', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
      const recipe = await spoonacular.getRecipeDetails(999);
      expect(recipe).toBeNull();
    });
  });
});
