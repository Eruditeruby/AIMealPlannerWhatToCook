const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.JWT_SECRET = 'test-secret-key';

const { generateToken } = require('../../utils/token');
const User = require('../../models/User');
const CookingLog = require('../../models/CookingLog');

let mongoServer, app, user, token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/cooking', require('../../routes/cooking'));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await CookingLog.deleteMany({});
  await User.deleteMany({});
  user = await User.create({
    googleId: 'g-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
  });
  token = generateToken(user);
});

describe('POST /api/cooking/log', () => {
  test('logs a cooked recipe', async () => {
    const res = await request(app)
      .post('/api/cooking/log')
      .set('Cookie', `token=${token}`)
      .send({ recipeTitle: 'Chicken Stir Fry', ingredientsUsed: ['chicken', 'rice'] });
    expect(res.status).toBe(201);
    expect(res.body.recipeTitle).toBe('Chicken Stir Fry');
    expect(res.body.ingredientsUsed).toEqual(['chicken', 'rice']);
    expect(res.body.estimatedSavings).toBe(5);
  });

  test('returns 400 without recipeTitle', async () => {
    const res = await request(app)
      .post('/api/cooking/log')
      .set('Cookie', `token=${token}`)
      .send({ ingredientsUsed: ['chicken'] });
    expect(res.status).toBe(400);
  });

  test('returns 400 without ingredientsUsed', async () => {
    const res = await request(app)
      .post('/api/cooking/log')
      .set('Cookie', `token=${token}`)
      .send({ recipeTitle: 'Test' });
    expect(res.status).toBe(400);
  });

  test('returns 400 with empty ingredientsUsed', async () => {
    const res = await request(app)
      .post('/api/cooking/log')
      .set('Cookie', `token=${token}`)
      .send({ recipeTitle: 'Test', ingredientsUsed: [] });
    expect(res.status).toBe(400);
  });

  test('returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/cooking/log')
      .send({ recipeTitle: 'Test', ingredientsUsed: ['a'] });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/cooking/history', () => {
  test('returns cooking history sorted by date desc', async () => {
    await CookingLog.create({ userId: user._id, recipeTitle: 'Old', ingredientsUsed: ['a'], estimatedSavings: 5, cookedAt: new Date('2025-01-01') });
    await CookingLog.create({ userId: user._id, recipeTitle: 'New', ingredientsUsed: ['b'], estimatedSavings: 5, cookedAt: new Date('2025-06-01') });

    const res = await request(app)
      .get('/api/cooking/history')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].recipeTitle).toBe('New');
  });

  test('returns empty array for new user', async () => {
    const res = await request(app)
      .get('/api/cooking/history')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 401 without auth', async () => {
    const res = await request(app).get('/api/cooking/history');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/cooking/savings', () => {
  test('returns savings summary', async () => {
    await CookingLog.create({ userId: user._id, recipeTitle: 'Today', ingredientsUsed: ['a'], estimatedSavings: 5 });
    await CookingLog.create({ userId: user._id, recipeTitle: 'Also today', ingredientsUsed: ['b'], estimatedSavings: 5 });

    const res = await request(app)
      .get('/api/cooking/savings')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(10);
    expect(res.body.mealsCooked).toBe(2);
    expect(res.body.weekly).toBeGreaterThanOrEqual(0);
    expect(res.body.monthly).toBeGreaterThanOrEqual(0);
  });

  test('returns zeros for new user', async () => {
    const res = await request(app)
      .get('/api/cooking/savings')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ weekly: 0, monthly: 0, total: 0, mealsCooked: 0 });
  });

  test('returns 401 without auth', async () => {
    const res = await request(app).get('/api/cooking/savings');
    expect(res.status).toBe(401);
  });
});
