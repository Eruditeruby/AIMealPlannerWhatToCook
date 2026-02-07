/**
 * Integration tests for complete authentication flow
 * Tests OAuth → JWT → Protected routes
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const User = require('../../models/User');
const { generateToken } = require('../../utils/token');

let mongoServer;

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

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Integration Flow', () => {
  describe('Complete OAuth Flow', () => {
    it('should handle full OAuth flow: callback → JWT → authenticated request', async () => {
      // Step 1: Simulate OAuth callback creating a user
      const mockGoogleProfile = {
        id: 'google-123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://example.com/avatar.jpg' }]
      };

      const user = await User.create({
        googleId: mockGoogleProfile.id,
        email: mockGoogleProfile.emails[0].value,
        name: mockGoogleProfile.displayName,
        avatar: mockGoogleProfile.photos[0].value
      });

      // Step 2: Generate JWT token (simulates server creating token after OAuth)
      const token = generateToken(user);

      // Step 3: Use token to access protected route
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`])
        .expect(200);

      expect(response.body).toMatchObject({
        id: user._id.toString(),
        email: 'test@example.com',
        name: 'Test User'
      });
    });

    it('should reject invalid JWT tokens', async () => {
      const invalidToken = 'invalid.jwt.token';

      await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${invalidToken}`])
        .expect(401);
    });

    it('should reject expired JWT tokens', async () => {
      const user = await User.create({
        googleId: 'google-456',
        email: 'expired@example.com',
        name: 'Expired User'
      });

      // Create token that expired 1 hour ago
      const expiredToken = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${expiredToken}`])
        .expect(401);
    });

    it('should reject token for non-existent user', async () => {
      const fakeUserId = new mongoose.Types.ObjectId();
      const token = generateToken({ _id: fakeUserId, email: 'fake@example.com' });

      await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`])
        .expect(404);
    });
  });

  describe('Logout Flow', () => {
    it('should clear JWT cookie on logout', async () => {
      const user = await User.create({
        googleId: 'google-789',
        email: 'logout@example.com',
        name: 'Logout User'
      });

      const token = generateToken(user);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`token=${token}`])
        .expect(200);

      expect(response.body).toEqual({ message: 'Logged out' });

      // Verify cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });

  describe('Auth State Persistence', () => {
    it('should maintain auth across multiple requests', async () => {
      const user = await User.create({
        googleId: 'google-persist',
        email: 'persist@example.com',
        name: 'Persist User'
      });

      const token = generateToken(user);

      // Request 1: Get user
      await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`])
        .expect(200);

      // Request 2: Get pantry (requires auth)
      await request(app)
        .get('/api/pantry')
        .set('Cookie', [`token=${token}`])
        .expect(200);

      // Request 3: Get saved recipes (requires auth)
      await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${token}`])
        .expect(200);
    });
  });
});
