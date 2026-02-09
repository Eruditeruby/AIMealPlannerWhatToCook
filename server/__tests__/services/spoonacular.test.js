process.env.SPOONACULAR_API_KEY = 'test-api-key';

// Mock global fetch
global.fetch = jest.fn();

const spoonacular = require('../../services/spoonacular');

afterEach(() => {
  jest.resetAllMocks();
  spoonacular.clearCache();
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

      const results = await spoonacular.findByIngredients(['beef', 'broccoli']);
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
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Server Error' });
      const results = await spoonacular.findByIngredients(['chicken']);
      expect(results).toEqual([]);
    });

    test('handles rate limit (402) gracefully', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 402, text: async () => 'Payment Required' });
      const results = await spoonacular.findByIngredients(['chicken']);
      expect(results).toEqual([]);
    });

    test('handles empty ingredients list', async () => {
      const results = await spoonacular.findByIngredients([]);
      expect(results).toEqual([]);
    });
  });

  describe('searchRecipes', () => {
    test('calls complexSearch URL with ingredients', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await spoonacular.searchRecipes(['chicken', 'rice']);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('complexSearch'),
        expect.any(Object)
      );
      const url = global.fetch.mock.calls[0][0];
      expect(url).toMatch(/chicken.*rice/);
    });

    test('passes diet and intolerances params', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await spoonacular.searchRecipes(['chicken'], {
        diet: 'vegetarian',
        intolerances: 'gluten',
      });

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('diet=vegetarian');
      expect(url).toContain('intolerances=gluten');
    });

    test('passes cuisine, type, and maxReadyTime params', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await spoonacular.searchRecipes(['chicken'], {
        cuisine: 'italian',
        type: 'main course',
        maxReadyTime: 30,
      });

      const url = global.fetch.mock.calls[0][0];
      expect(url).toContain('cuisine=italian');
      expect(url).toContain('type=main+course');
      expect(url).toContain('maxReadyTime=30');
    });

    test('does not include undefined optional params in URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] }),
      });

      await spoonacular.searchRecipes(['chicken']);

      const url = global.fetch.mock.calls[0][0];
      expect(url).not.toContain('diet=');
      expect(url).not.toContain('intolerances=');
      expect(url).not.toContain('cuisine=');
    });

    test('returns normalized recipe array from complexSearch', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 456,
              title: 'Veggie Bowl',
              image: 'https://img.com/vb.jpg',
              readyInMinutes: 25,
              servings: 2,
              usedIngredients: [{ name: 'rice' }],
              missedIngredients: [{ name: 'tofu' }],
              nutrition: {
                nutrients: [
                  { name: 'Calories', amount: 350 },
                  { name: 'Protein', amount: 15 },
                  { name: 'Carbohydrates', amount: 50 },
                  { name: 'Fat', amount: 8 },
                ],
              },
            },
          ],
        }),
      });

      const results = await spoonacular.searchRecipes(['rice']);
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual({
        id: 456,
        title: 'Veggie Bowl',
        image: 'https://img.com/vb.jpg',
        source: 'spoonacular',
        sourceId: '456',
        cookTime: 25,
        servings: 2,
        usedIngredients: ['rice'],
        missedIngredients: ['tofu'],
        nutrition: { calories: 350, protein: 15, carbs: 50, fat: 8 },
      });
    });

    test('handles API error gracefully', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' });
      const results = await spoonacular.searchRecipes(['chicken']);
      expect(results).toEqual([]);
    });

    test('handles empty ingredients list', async () => {
      const results = await spoonacular.searchRecipes([]);
      expect(results).toEqual([]);
    });

    test('caches results with filter params in key', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ id: 1, title: 'T', image: null, readyInMinutes: 10, servings: 2 }] }),
      });

      await spoonacular.searchRecipes(['chicken'], { diet: 'vegan' });
      await spoonacular.searchRecipes(['chicken'], { diet: 'vegan' });

      // Second call should use cache — only 1 fetch
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('different filters produce different cache keys', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: [{ id: 1, title: 'A', image: null, readyInMinutes: 10, servings: 2 }] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: [{ id: 2, title: 'B', image: null, readyInMinutes: 20, servings: 4 }] }),
        });

      await spoonacular.searchRecipes(['chicken'], { diet: 'vegan' });
      await spoonacular.searchRecipes(['chicken'], { diet: 'vegetarian' });

      expect(global.fetch).toHaveBeenCalledTimes(2);
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
