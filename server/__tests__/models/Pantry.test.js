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

const makeItem = (name, overrides = {}) => ({
  name,
  category: 'other',
  perishable: false,
  ...overrides,
});

describe('Pantry Model', () => {
  const userId = new mongoose.Types.ObjectId();

  test('creates a pantry with userId and items', async () => {
    const pantry = await Pantry.create({
      userId,
      items: [makeItem('chicken'), makeItem('rice')],
    });
    expect(pantry.userId.toString()).toBe(userId.toString());
    expect(pantry.items).toHaveLength(2);
    expect(pantry.items[0].name).toBe('chicken');
    expect(pantry.items[1].name).toBe('rice');
  });

  test('userId is required', async () => {
    await expect(Pantry.create({ items: [makeItem('chicken')] })).rejects.toThrow(/userId/);
  });

  test('items defaults to empty array', async () => {
    const pantry = await Pantry.create({ userId });
    expect(pantry.items).toEqual([]);
  });

  test('item name is required', async () => {
    await expect(
      Pantry.create({ userId, items: [{ category: 'vegetable', perishable: true }] })
    ).rejects.toThrow(/name/);
  });

  test('item addedAt defaults to now', async () => {
    const pantry = await Pantry.create({ userId, items: [makeItem('chicken')] });
    expect(pantry.items[0].addedAt).toBeInstanceOf(Date);
    expect(Date.now() - pantry.items[0].addedAt.getTime()).toBeLessThan(5000);
  });

  test('item category validates enum values', async () => {
    await expect(
      Pantry.create({ userId, items: [{ name: 'chicken', category: 'invalid' }] })
    ).rejects.toThrow(/category/);
  });

  test('item category defaults to other', async () => {
    const pantry = await Pantry.create({ userId, items: [{ name: 'unknown-item' }] });
    expect(pantry.items[0].category).toBe('other');
  });

  test('item perishable defaults to false', async () => {
    const pantry = await Pantry.create({ userId, items: [{ name: 'rice' }] });
    expect(pantry.items[0].perishable).toBe(false);
  });

  test('accepts perishable items', async () => {
    const pantry = await Pantry.create({
      userId,
      items: [makeItem('spinach', { category: 'vegetable', perishable: true })],
    });
    expect(pantry.items[0].perishable).toBe(true);
    expect(pantry.items[0].category).toBe('vegetable');
  });

  test('createdAt and updatedAt are auto-set', async () => {
    const pantry = await Pantry.create({ userId, items: [makeItem('chicken')] });
    expect(pantry.createdAt).toBeInstanceOf(Date);
    expect(pantry.updatedAt).toBeInstanceOf(Date);
  });

  test('one pantry per user (unique userId)', async () => {
    await Pantry.create({ userId, items: [makeItem('chicken')] });
    await Pantry.ensureIndexes();
    await expect(Pantry.create({ userId, items: [makeItem('rice')] })).rejects.toThrow();
  });
});
