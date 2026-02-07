const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

const User = require('../../models/User');

describe('User Model', () => {
  const validUser = {
    googleId: '123456789',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
  };

  test('creates a valid user with all fields', async () => {
    const user = await User.create(validUser);
    expect(user.googleId).toBe('123456789');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.avatar).toBe('https://example.com/avatar.jpg');
  });

  test('googleId is required', async () => {
    const { googleId, ...noGoogleId } = validUser;
    await expect(User.create(noGoogleId)).rejects.toThrow(/googleId/);
  });

  test('email is required', async () => {
    const { email, ...noEmail } = validUser;
    await expect(User.create(noEmail)).rejects.toThrow(/email/);
  });

  test('createdAt defaults to now', async () => {
    const user = await User.create(validUser);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(Date.now() - user.createdAt.getTime()).toBeLessThan(5000);
  });

  test('preferences.dietaryRestrictions defaults to empty array', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.dietaryRestrictions).toEqual([]);
  });

  test('preferences.familySize defaults to null', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.familySize).toBeNull();
  });

  test('rejects duplicate googleId', async () => {
    await User.create(validUser);
    await User.ensureIndexes();
    await expect(User.create(validUser)).rejects.toThrow();
  });
});
