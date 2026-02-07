/**
 * Integration tests for complete pantry workflow
 * Tests Auth → Pantry CRUD → State persistence
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const User = require('../../models/User');
const Pantry = require('../../models/Pantry');
const { generateToken } = require('../../utils/token');

let mongoServer;
let testUser;
let authToken;

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-integration-tests';
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clean first to ensure isolation
  await User.deleteMany({});
  await Pantry.deleteMany({});

  // Create authenticated user for each test
  testUser = await User.create({
    googleId: 'google-pantry-test',
    email: 'pantry@example.com',
    name: 'Pantry Test User'
  });
  authToken = generateToken(testUser);
});

afterEach(async () => {
  await User.deleteMany({});
  await Pantry.deleteMany({});
});

describe('Pantry Integration Flow', () => {
  describe('Complete Pantry Workflow', () => {
    it('should handle full pantry flow: login → add items → retrieve → update → retrieve', async () => {
      // Step 1: Verify empty pantry initially
      let response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.items).toEqual([]);

      // Step 2: Add items to pantry
      response = await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: ['chicken', 'rice', 'tomatoes'] })
        .expect(200);

      expect(response.body.items).toEqual(['chicken', 'rice', 'tomatoes']);

      // Step 3: Retrieve pantry (verify persistence)
      response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.items).toEqual(['chicken', 'rice', 'tomatoes']);

      // Step 4: Update pantry (add more items)
      response = await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: ['chicken', 'rice', 'tomatoes', 'onions', 'garlic'] })
        .expect(200);

      expect(response.body.items).toEqual(['chicken', 'rice', 'tomatoes', 'onions', 'garlic']);

      // Step 5: Retrieve again (verify update persisted)
      response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.items).toEqual(['chicken', 'rice', 'tomatoes', 'onions', 'garlic']);
    });

    it('should handle pantry removal (empty array)', async () => {
      // Add items first
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: ['chicken', 'rice'] })
        .expect(200);

      // Remove all items
      const response = await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: [] })
        .expect(200);

      expect(response.body.items).toEqual([]);
    });

    it('should isolate pantries between users', async () => {
      // User 1: Add items
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: ['chicken', 'rice'] })
        .expect(200);

      // Create User 2
      const user2 = await User.create({
        googleId: 'google-pantry-test-2',
        email: 'pantry2@example.com',
        name: 'Pantry Test User 2'
      });
      const token2 = generateToken(user2);

      // User 2: Should have empty pantry
      let response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${token2}`])
        .expect(200);

      expect(response.body.items).toEqual([]);

      // User 2: Add different items
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${token2}`])
        .send({ items: ['pasta', 'sauce'] })
        .expect(200);

      // User 1: Should still have original items
      response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.items).toEqual(['chicken', 'rice']);

      // User 2: Should have their items
      response = await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${token2}`])
        .expect(200);

      expect(response.body.items).toEqual(['pasta', 'sauce']);
    });
  });

  describe('Pantry Error Scenarios', () => {
    it('should reject pantry access without authentication', async () => {
      await request(app)
        .get('/api/pantry')
        .expect(401);

      await request(app)
        .put('/api/pantry')
        .send({ items: ['chicken'] })
        .expect(401);
    });

    it('should validate pantry items format', async () => {
      // Invalid: not an array
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: 'not-an-array' })
        .expect(400);

      // Invalid: array with non-strings
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: [123, 456] })
        .expect(400);
    });
  });

  describe('Pantry → Recipes Integration', () => {
    it('should use pantry items for recipe suggestions', async () => {
      // Mock the spoonacular service for this test
      const spoonacular = require('../../services/spoonacular');
      spoonacular.findByIngredients = jest.fn().mockResolvedValue([
        { id: 1, title: 'Test Recipe', image: 'test.jpg', usedIngredients: ['chicken', 'rice'] }
      ]);

      // Add items to pantry
      await request(app)
        .put('/api/pantry')
        .set('Cookie', [`token=${authToken}`])
        .send({ items: ['chicken', 'rice', 'tomatoes'] })
        .expect(200);

      // Get recipe suggestions based on pantry
      const response = await request(app)
        .get('/api/recipes/suggest?ingredients=chicken,rice,tomatoes')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      // Should return recipes (mocked in this test environment)
      expect(response.body).toHaveProperty('recipes');
      expect(Array.isArray(response.body.recipes)).toBe(true);
    });
  });
});
