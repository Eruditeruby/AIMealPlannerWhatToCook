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

  test('calls Spoonacular with parsed ingredients', async () => {
    spoonacular.findByIngredients.mockResolvedValue([
      { id: 1, title: 'R1', image: null, usedIngredients: [], missedIngredients: [] },
      { id: 2, title: 'R2', image: null, usedIngredients: [], missedIngredients: [] },
      { id: 3, title: 'R3', image: null, usedIngredients: [], missedIngredients: [] },
    ]);

    await request(app)
      .get('/api/recipes/suggest?ingredients=chicken,rice')
      .set('Cookie', `token=${token}`);

    expect(spoonacular.findByIngredients).toHaveBeenCalledWith(['chicken', 'rice']);
  });

  test('returns Spoonacular results without AI if 3+ results', async () => {
    spoonacular.findByIngredients.mockResolvedValue([
      { id: 1, title: 'R1' }, { id: 2, title: 'R2' }, { id: 3, title: 'R3' },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken,rice')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toHaveLength(3);
    expect(openrouter.suggestRecipes).not.toHaveBeenCalled();
  });

  test('calls OpenRouter if Spoonacular returns < 3 results', async () => {
    spoonacular.findByIngredients.mockResolvedValue([{ id: 1, title: 'R1' }]);
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
    spoonacular.findByIngredients.mockResolvedValue([
      { id: 1, title: 'Spoon Recipe' },
    ]);
    openrouter.suggestRecipes.mockResolvedValue([
      { title: 'AI Recipe', source: 'ai', sourceId: null },
    ]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=chicken')
      .set('Cookie', `token=${token}`);

    const sources = res.body.recipes.map((r) => r.source || 'spoonacular');
    expect(sources).toContain('ai');
  });

  test('handles both services failing', async () => {
    spoonacular.findByIngredients.mockResolvedValue([]);
    openrouter.suggestRecipes.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/recipes/suggest?ingredients=xyz')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.recipes).toEqual([]);
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
