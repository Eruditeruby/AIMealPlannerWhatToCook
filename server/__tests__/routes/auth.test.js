const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '7d';

const { generateToken } = require('../../utils/token');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const express = require('express');
  const cookieParser = require('cookie-parser');
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/auth', require('../../routes/auth'));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const User = require('../../models/User');

describe('Auth Routes', () => {
  test('GET /api/auth/me returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me returns user profile with valid token', async () => {
    const user = await User.create({
      googleId: 'g-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://avatar.url',
    });

    const token = generateToken(user);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.name).toBe('Test User');
  });

  test('GET /api/auth/me response shape has id, email, name, avatar, preferences', async () => {
    const user = await User.create({
      googleId: 'g-123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://avatar.url',
    });

    const token = generateToken(user);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `token=${token}`);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('avatar');
    expect(res.body).toHaveProperty('preferences');
  });

  test('POST /api/auth/logout clears the JWT cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=;/);
  });
});
