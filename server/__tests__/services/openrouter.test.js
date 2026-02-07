process.env.OPENROUTER_API_KEY = 'test-api-key';

global.fetch = jest.fn();

const openrouter = require('../../services/openrouter');

afterEach(() => {
  jest.resetAllMocks();
});

const mockAIResponse = (recipes) => ({
  ok: true,
  json: async () => ({
    choices: [
      {
        message: {
          content: JSON.stringify({ recipes }),
        },
      },
    ],
  }),
});

describe('OpenRouter AI Client', () => {
  test('sends correct prompt to OpenRouter', async () => {
    global.fetch.mockResolvedValueOnce(mockAIResponse([]));

    await openrouter.suggestRecipes(['chicken', 'rice']);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
        }),
      })
    );
  });

  test('prompt includes family-friendly instruction', async () => {
    global.fetch.mockResolvedValueOnce(mockAIResponse([]));

    await openrouter.suggestRecipes(['chicken']);

    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    const prompt = body.messages[0].content;
    expect(prompt.toLowerCase()).toContain('family-friendly');
  });

  test('returns normalized recipe array', async () => {
    global.fetch.mockResolvedValueOnce(
      mockAIResponse([
        {
          title: 'Chicken Rice',
          image: null,
          instructions: 'Cook it.',
          ingredients: ['chicken', 'rice'],
          cookTime: 25,
          servings: 4,
          tags: ['kid-friendly'],
          nutrition: { calories: 400, protein: 25, carbs: 45, fat: 10 },
        },
      ])
    );

    const results = await openrouter.suggestRecipes(['chicken', 'rice']);
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Chicken Rice');
    expect(results[0].source).toBe('ai');
  });

  test('handles malformed AI response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'not valid json' } }],
      }),
    });

    const results = await openrouter.suggestRecipes(['chicken']);
    expect(results).toEqual([]);
  });

  test('handles API error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const results = await openrouter.suggestRecipes(['chicken']);
    expect(results).toEqual([]);
  });

  test('handles empty ingredients list', async () => {
    const results = await openrouter.suggestRecipes([]);
    expect(results).toEqual([]);
  });
});
