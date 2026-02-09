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

describe('Preferences API', () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await User.create({
      googleId: 'pref-api-123',
      email: 'pref@example.com',
      name: 'Pref User',
    });
    token = generateToken(user);
  });

  describe('GET /api/auth/preferences', () => {
    test('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/preferences');
      expect(res.status).toBe(401);
    });

    test('returns user preferences with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/preferences')
        .set('Cookie', `token=${token}`);

      expect(res.status).toBe(200);
      expect(res.body.preferences).toBeDefined();
      expect(res.body.preferences.budgetGoal).toBe('medium');
      expect(res.body.preferences.cookingSkill).toBe('intermediate');
      expect(res.body.preferences.householdType).toBe('family-small');
      expect(res.body.preferences.onboardingComplete).toBe(false);
    });
  });

  describe('PUT /api/auth/preferences', () => {
    test('returns 401 without token', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .send({ budgetGoal: 'low' });
      expect(res.status).toBe(401);
    });

    test('updates budgetGoal', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({ budgetGoal: 'low' });

      expect(res.status).toBe(200);
      expect(res.body.preferences.budgetGoal).toBe('low');
    });

    test('updates multiple fields at once', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({
          budgetGoal: 'high',
          cookingSkill: 'advanced',
          householdType: 'couple',
          onboardingComplete: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.preferences.budgetGoal).toBe('high');
      expect(res.body.preferences.cookingSkill).toBe('advanced');
      expect(res.body.preferences.householdType).toBe('couple');
      expect(res.body.preferences.onboardingComplete).toBe(true);
    });

    test('returns 400 for empty body', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/No valid/);
    });

    test('returns 400 for invalid budgetGoal enum value', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({ budgetGoal: 'extreme' });

      expect(res.status).toBe(400);
    });

    test('ignores unknown fields', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({ budgetGoal: 'low', unknownField: 'hacker' });

      expect(res.status).toBe(200);
      expect(res.body.preferences.budgetGoal).toBe('low');
    });

    test('updates dietaryRestrictions array', async () => {
      const res = await request(app)
        .put('/api/auth/preferences')
        .set('Cookie', `token=${token}`)
        .send({ dietaryRestrictions: ['vegetarian', 'gluten-free'] });

      expect(res.status).toBe(200);
      expect(res.body.preferences.dietaryRestrictions).toEqual(['vegetarian', 'gluten-free']);
    });
  });
});
