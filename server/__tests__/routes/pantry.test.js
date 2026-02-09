const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');
const cookieParser = require('cookie-parser');

process.env.JWT_SECRET = 'test-secret-key';

const { generateToken } = require('../../utils/token');
const User = require('../../models/User');
const Pantry = require('../../models/Pantry');

const makeItem = (name, overrides = {}) => ({
  name,
  category: 'other',
  perishable: false,
  ...overrides,
});

let mongoServer, app, user, token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/pantry', require('../../routes/pantry'));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  user = await User.create({
    googleId: 'g-123',
    email: 'test@example.com',
    name: 'Test User',
    avatar: null,
  });
  token = generateToken(user);
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('GET /api/pantry', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).get('/api/pantry');
    expect(res.status).toBe(401);
  });

  test('returns empty pantry for new user', async () => {
    const res = await request(app)
      .get('/api/pantry')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.pantryItems).toEqual([]);
  });

  test('returns existing pantry items', async () => {
    await Pantry.create({
      userId: user._id,
      items: [makeItem('chicken', { category: 'protein', perishable: true }), makeItem('rice', { category: 'grain' })],
    });
    const res = await request(app)
      .get('/api/pantry')
      .set('Cookie', `token=${token}`);
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual(['chicken', 'rice']);
    expect(res.body.pantryItems).toHaveLength(2);
    expect(res.body.pantryItems[0].name).toBe('chicken');
    expect(res.body.pantryItems[0].perishable).toBe(true);
  });

  test('response shape has items, pantryItems, and updatedAt', async () => {
    await Pantry.create({
      userId: user._id,
      items: [makeItem('garlic', { category: 'vegetable', perishable: true })],
    });
    const res = await request(app)
      .get('/api/pantry')
      .set('Cookie', `token=${token}`);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('pantryItems');
    expect(res.body).toHaveProperty('updatedAt');
  });
});

describe('PUT /api/pantry', () => {
  test('returns 401 without auth', async () => {
    const res = await request(app).put('/api/pantry').send({ items: ['a'] });
    expect(res.status).toBe(401);
  });

  test('creates pantry if none exists', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['chicken breast', 'white rice'] });
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual(['chicken breast', 'white rice']);
    expect(res.body.pantryItems).toHaveLength(2);
    expect(res.body.pantryItems[0].name).toBe('chicken breast');
    expect(res.body.pantryItems[0].category).toBe('protein');
    expect(res.body.pantryItems[0].perishable).toBe(true);
  });

  test('updates existing pantry items', async () => {
    await Pantry.create({ userId: user._id, items: [makeItem('old')] });
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['new1', 'new2'] });
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual(['new1', 'new2']);
  });

  test('rejects non-array items', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: 'not-array' });
    expect(res.status).toBe(400);
  });

  test('rejects non-string items in array', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: [123, true] });
    expect(res.status).toBe(400);
  });

  test('trims and lowercases item names', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['  Chicken  ', '  RICE'] });
    expect(res.body.items).toEqual(['chicken', 'rice']);
  });

  test('removes duplicate items', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['chicken', 'Chicken', 'CHICKEN'] });
    expect(res.body.items).toEqual(['chicken']);
  });

  test('updates updatedAt timestamp', async () => {
    await Pantry.create({ userId: user._id, items: [makeItem('old')] });
    const before = new Date();
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['new'] });
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
  });

  test('auto-enriches items with ingredient metadata', async () => {
    const res = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['spinach', 'spaghetti'] });

    expect(res.body.pantryItems[0].name).toBe('spinach');
    expect(res.body.pantryItems[0].category).toBe('vegetable');
    expect(res.body.pantryItems[0].perishable).toBe(true);

    expect(res.body.pantryItems[1].name).toBe('spaghetti');
    expect(res.body.pantryItems[1].category).toBe('grain');
    expect(res.body.pantryItems[1].perishable).toBe(false);
  });

  test('preserves addedAt for existing items', async () => {
    // Add initial items
    const res1 = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['chicken'] });
    const originalAddedAt = res1.body.pantryItems[0].addedAt;

    // Update with same + new item
    const res2 = await request(app)
      .put('/api/pantry')
      .set('Cookie', `token=${token}`)
      .send({ items: ['chicken', 'rice'] });

    expect(res2.body.pantryItems[0].addedAt).toBe(originalAddedAt);
    expect(res2.body.pantryItems).toHaveLength(2);
  });
});
