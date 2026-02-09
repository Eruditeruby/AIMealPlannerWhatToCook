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

const CookingLog = require('../../models/CookingLog');

describe('CookingLog Model', () => {
  const userId = new mongoose.Types.ObjectId();

  test('creates a cooking log with all fields', async () => {
    const log = await CookingLog.create({
      userId,
      recipeTitle: 'Chicken Stir Fry',
      ingredientsUsed: ['chicken', 'rice', 'broccoli'],
      estimatedSavings: 5,
    });
    expect(log.userId.toString()).toBe(userId.toString());
    expect(log.recipeTitle).toBe('Chicken Stir Fry');
    expect(log.ingredientsUsed).toEqual(['chicken', 'rice', 'broccoli']);
    expect(log.estimatedSavings).toBe(5);
    expect(log.cookedAt).toBeInstanceOf(Date);
  });

  test('requires userId', async () => {
    await expect(
      CookingLog.create({ recipeTitle: 'Test', ingredientsUsed: ['a'], estimatedSavings: 5 })
    ).rejects.toThrow();
  });

  test('requires recipeTitle', async () => {
    await expect(
      CookingLog.create({ userId, ingredientsUsed: ['a'], estimatedSavings: 5 })
    ).rejects.toThrow();
  });

  test('requires at least one ingredient', async () => {
    await expect(
      CookingLog.create({ userId, recipeTitle: 'Test', ingredientsUsed: [], estimatedSavings: 5 })
    ).rejects.toThrow(/At least one ingredient/);
  });

  test('requires estimatedSavings', async () => {
    await expect(
      CookingLog.create({ userId, recipeTitle: 'Test', ingredientsUsed: ['a'] })
    ).rejects.toThrow();
  });

  test('defaults cookedAt to now', async () => {
    const before = new Date();
    const log = await CookingLog.create({
      userId,
      recipeTitle: 'Test',
      ingredientsUsed: ['a'],
      estimatedSavings: 5,
    });
    expect(log.cookedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
  });

  test('allows multiple logs per user', async () => {
    await CookingLog.create({ userId, recipeTitle: 'Meal 1', ingredientsUsed: ['a'], estimatedSavings: 5 });
    await CookingLog.create({ userId, recipeTitle: 'Meal 2', ingredientsUsed: ['b'], estimatedSavings: 5 });
    const logs = await CookingLog.find({ userId });
    expect(logs).toHaveLength(2);
  });

  test('sorts by cookedAt descending via index', async () => {
    await CookingLog.create({ userId, recipeTitle: 'Old', ingredientsUsed: ['a'], estimatedSavings: 5, cookedAt: new Date('2025-01-01') });
    await CookingLog.create({ userId, recipeTitle: 'New', ingredientsUsed: ['b'], estimatedSavings: 5, cookedAt: new Date('2025-06-01') });
    const logs = await CookingLog.find({ userId }).sort({ cookedAt: -1 });
    expect(logs[0].recipeTitle).toBe('New');
    expect(logs[1].recipeTitle).toBe('Old');
  });
});
