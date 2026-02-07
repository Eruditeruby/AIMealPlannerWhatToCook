const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/auth/google/callback';
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const User = require('../../models/User');
const { handleGoogleCallback } = require('../../config/passport');

describe('Passport Google Strategy', () => {
  const profile = {
    id: 'google-123',
    emails: [{ value: 'test@gmail.com' }],
    displayName: 'Test User',
    photos: [{ value: 'https://photo.url/avatar.jpg' }],
  };

  test('creates new user if googleId not found', async () => {
    const done = jest.fn();
    await handleGoogleCallback(null, null, profile, done);

    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
      googleId: 'google-123',
      email: 'test@gmail.com',
      name: 'Test User',
    }));

    const count = await User.countDocuments();
    expect(count).toBe(1);
  });

  test('returns existing user if googleId found', async () => {
    await User.create({
      googleId: 'google-123',
      email: 'test@gmail.com',
      name: 'Test User',
      avatar: 'https://photo.url/avatar.jpg',
    });

    const done = jest.fn();
    await handleGoogleCallback(null, null, profile, done);

    const count = await User.countDocuments();
    expect(count).toBe(1);
    expect(done).toHaveBeenCalledWith(null, expect.objectContaining({
      googleId: 'google-123',
    }));
  });

  test('user object has id, email, name, avatar', async () => {
    const done = jest.fn();
    await handleGoogleCallback(null, null, profile, done);

    const user = done.mock.calls[0][1];
    expect(user.googleId).toBe('google-123');
    expect(user.email).toBe('test@gmail.com');
    expect(user.name).toBe('Test User');
    expect(user.avatar).toBe('https://photo.url/avatar.jpg');
  });
});
