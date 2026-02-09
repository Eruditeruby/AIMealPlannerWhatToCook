const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.JWT_SECRET = 'test-secret-key';
process.env.SPOONACULAR_API_KEY = 'test-key';
process.env.OPENROUTER_API_KEY = 'test-key';

const { generateToken } = require('../../utils/token');
const User = require('../../models/User');
const SavedRecipe = require('../../models/SavedRecipe');

// Mock service clients
jest.mock('../../services/spoonacular');
jest.mock('../../services/openrouter');
const spoonacular = require('../../services/spoonacular');
const openrouter = require('../../services/openrouter');

let mongoServer, app, user, token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/recipes', require('../../routes/recipes'));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  user = await User.create({
    googleId: 'g-123', email: 'test@example.com', name: 'Test', avatar: null,
  });
  token = generateToken(user);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
  jest.resetAllMocks();
});

describe('GET /api/recipes/suggest', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).get('/api/recipes/suggest?ingredients=chicken');
    expect(res.status).toBe(401);
  });

  test('returns 400 if no ingredients param', async () => {
    const res = await request(app)
      .get('/api/recipes/suggest')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(400);
  });

  test('calls searchRecipes with parsed ingredients', async () => {
    spoonacular.searchRecipes.mockResolvedValue([
      { id: 1, title: 'R1', image: null, usedIngredients: [], missedIngredients: [] },
      { id: 2, title: 'R2', image: null, usedIngredients: [], missedIngredients: [] },
      { id: 3, title: 'R3', image: null, usedIngredients: [], missedIngredients: [] },
    ]);

    await request(app)
      .get('/api/recipes/suggest?ingredients=chicken,rice')
      .set('Cookie', `token=${token}`);

    expect(spoonacular.searchRecipes).toHaveBeenCalledWith(
      ['chicken', 'rice'],
      expect.any(Object)
    );
  });

  test('returns results without AI if 3+ results', async () => {
    spoonacular.searchRecipes.mockResolvedValue([
      { id: 1, title: 'R1' }, { id: 2, title: 'R2' }, { id: 3, title: 'R3' },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken,rice')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(3);
    expect(openrouter.suggestRecipes).not.toHaveBeenCalled();
  });

  test('calls OpenRouter if searchRecipes returns < 3 results', async () => {
    spoonacular.searchRecipes.mockResolvedValue([{ id: 1, title: 'R1' }]);
    openrouter.suggestRecipes.mockResolvedValue([
      { title: 'AI Recipe', source: 'ai', sourceId: null },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken')
      .set('Cookie', `token=${token}`);

    expect(openrouter.suggestRecipes).toHaveBeenCalled();
    expect(res.body.recipes.length).toBeGreaterThanOrEqual(1);
  });

  test('merges results and marks source', async () => {
    spoonacular.searchRecipes.mockResolvedValue([
      { id: 1, title: 'Spoon Recipe', source: 'spoonacular' },
    ]);
    openrouter.suggestRecipes.mockResolvedValue([
      { title: 'AI Recipe', source: 'ai', sourceId: null },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken')
      .set('Cookie', `token=${token}`);

    const sources = res.body.recipes.map((r) => r.source);
    expect(sources).toContain('ai');
  });

  test('handles both services failing', async () => {
    spoonacular.searchRecipes.mockResolvedValue([]);
    openrouter.suggestRecipes.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=xyz')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
  });

  test('passes user dietary restrictions to searchRecipes', async () => {
    // Update user with dietary preferences
    await User.findByIdAndUpdate(user._id, {
      'preferences.dietaryRestrictions': ['vegetarian', 'gluten-free'],
    });

    spoonacular.searchRecipes.mockResolvedValue([
      { id: 1, title: 'R1' }, { id: 2, title: 'R2' }, { id: 3, title: 'R3' },
    ]);

    await request(app)
      .get('/api/recipes/suggest?ingredients=tofu')
      .set('Cookie', `token=${token}`);

    const options = spoonacular.searchRecipes.mock.calls[0][1];
    expect(options.diet).toBe('vegetarian');
    expect(options.intolerances).toBe('gluten');
  });

  test('passes filter query params to searchRecipes', async () => {
    spoonacular.searchRecipes.mockResolvedValue([
      { id: 1, title: 'R1' }, { id: 2, title: 'R2' }, { id: 3, title: 'R3' },
    ]);

    await request(app)
      .get('/api/recipes/suggest?ingredients=chicken&mealType=dinner&maxTime=30&cuisine=italian')
      .set('Cookie', `token=${token}`);

    const options = spoonacular.searchRecipes.mock.calls[0][1];
    expect(options.type).toBe('dinner');
    expect(options.maxReadyTime).toBe(30);
    expect(options.cuisine).toBe('italian');
  });

  test('passes user preferences to OpenRouter fallback', async () => {
    await User.findByIdAndUpdate(user._id, {
      'preferences.dietaryRestrictions': ['vegan'],
      'preferences.householdType': 'couple',
      'preferences.budgetGoal': 'low',
    });

    spoonacular.searchRecipes.mockResolvedValue([]);
    openrouter.suggestRecipes.mockResolvedValue([
      { title: 'AI Vegan', source: 'ai', sourceId: null },
    ]);

    await request(app)
      .get('/api/recipes/suggest?ingredients=beans')
      .set('Cookie', `token=${token}`);

    const prefs = openrouter.suggestRecipes.mock.calls[0][1];
    expect(prefs.dietaryRestrictions).toEqual(['vegan']);
    expect(prefs.householdType).toBe('couple');
    expect(prefs.budgetGoal).toBe('low');
  });

  test('falls back to findByIngredients if searchRecipes fails', async () => {
    spoonacular.searchRecipes.mockRejectedValue(new Error('complexSearch failed'));
    spoonacular.findByIngredients.mockResolvedValue([
      { id: 1, title: 'Fallback', usedIngredients: [], missedIngredients: [] },
      { id: 2, title: 'F2', usedIngredients: [], missedIngredients: [] },
      { id: 3, title: 'F3', usedIngredients: [], missedIngredients: [] },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(spoonacular.findByIngredients).toHaveBeenCalled();
    expect(res.body.recipes.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/recipes/saved', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).post('/api/recipes/saved').send({ title: 'X' });
    expect(res.status).toBe(401);
  });

  test('saves recipe and returns document', async () => {
    const res = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send({
        title: 'Test Recipe', source: 'ai', ingredients: ['a', 'b'],
        instructions: 'Cook.', cookTime: 20, servings: 2,
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Recipe');
  });

  test('returns 400 if required fields missing', async () => {
    const res = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send({ title: 'No source or ingredients' });
    expect(res.status).toBe(400);
  });

  test('returns 409 when saving duplicate recipe by sourceId', async () => {
    const payload = {
      title: 'Dup Recipe', source: 'spoonacular', sourceId: '999',
      ingredients: ['a', 'b'],
    };

    const first = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send(payload);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send(payload);
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('Recipe already saved');
    expect(second.body.recipe._id).toBe(first.body._id);
  });

  test('returns 409 when saving duplicate recipe by title (no sourceId)', async () => {
    const payload = {
      title: 'AI Dup Recipe', source: 'ai', ingredients: ['x'],
    };

    const first = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send(payload);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send(payload);
    expect(second.status).toBe(409);
  });

  test('allows different users to save same recipe', async () => {
    const user2 = await User.create({
      googleId: 'g-456', email: 'user2@example.com', name: 'User2', avatar: null,
    });
    const token2 = generateToken(user2);
    const payload = {
      title: 'Shared Recipe', source: 'spoonacular', sourceId: '888',
      ingredients: ['a'],
    };

    const res1 = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token}`)
      .send(payload);
    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/api/recipes/saved')
      .set('Cookie', `token=${token2}`)
      .send(payload);
    expect(res2.status).toBe(201);
  });
});

describe('GET /api/recipes/saved', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).get('/api/recipes/saved');
    expect(res.status).toBe(401);
  });

  test('returns empty array for user with no saved recipes', async () => {
    const res = await request(app)
      .get('/api/recipes/saved')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns saved recipes sorted by savedAt desc', async () => {
    await SavedRecipe.create({
      userId: user._id, title: 'Old', source: 'ai', ingredients: ['a'],
      savedAt: new Date('2024-01-01'),
    });
    await SavedRecipe.create({
      userId: user._id, title: 'New', source: 'ai', ingredients: ['b'],
      savedAt: new Date('2024-06-01'),
    });

    const res = await request(app)
      .get('/api/recipes/saved')
      .set('Cookie', `token=${token}`);
    expect(res.body[0].title).toBe('New');
    expect(res.body[1].title).toBe('Old');
  });
});

describe('DELETE /api/recipes/saved/:id', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).delete('/api/recipes/saved/abc');
    expect(res.status).toBe(401);
  });

  test('deletes saved recipe', async () => {
    const recipe = await SavedRecipe.create({
      userId: user._id, title: 'Del', source: 'ai', ingredients: ['a'],
    });
    const res = await request(app)
      .delete(`/api/recipes/saved/${recipe._id}`)
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(await SavedRecipe.countDocuments()).toBe(0);
  });

  test('returns 404 if not found or wrong user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/recipes/saved/${fakeId}`)
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(404);
  });
});
