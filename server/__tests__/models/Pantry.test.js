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

const Pantry = require('../../models/Pantry');

describe('Pantry Model', () => {
  const userId = new mongoose.Types.ObjectId();

  test('creates a pantry with userId and items', async () => {
    const pantry = await Pantry.create({ userId, items: ['chicken', 'rice'] });
    expect(pantry.userId.toString()).toBe(userId.toString());
    expect(pantry.items).toEqual(['chicken', 'rice']);
  });

  test('userId is required', async () => {
    await expect(Pantry.create({ items: ['chicken'] })).rejects.toThrow(/userId/);
  });

  test('items defaults to empty array', async () => {
    const pantry = await Pantry.create({ userId });
    expect(pantry.items).toEqual([]);
  });

  test('items only accepts strings', async () => {
    const pantry = await Pantry.create({ userId, items: ['chicken', 'rice'] });
    expect(pantry.items.every((i) => typeof i === 'string')).toBe(true);
  });

  test('createdAt and updatedAt are auto-set', async () => {
    const pantry = await Pantry.create({ userId, items: ['chicken'] });
    expect(pantry.createdAt).toBeInstanceOf(Date);
    expect(pantry.updatedAt).toBeInstanceOf(Date);
  });

  test('one pantry per user (unique userId)', async () => {
    await Pantry.create({ userId, items: ['chicken'] });
    await Pantry.ensureIndexes();
    await expect(Pantry.create({ userId, items: ['rice'] })).rejects.toThrow();
  });
});
