const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await mongoose.disconnect();
});

describe('connectDB', () => {
  test('connects to MongoDB successfully', async () => {
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    const connectDB = require('../../config/db');
    await connectDB();

    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });

  test('throws on invalid URI', async () => {
    process.env.MONGODB_URI = 'mongodb://invalid:9999/bad';

    const connectDB = require('../../config/db');

    await expect(
      connectDB({ serverSelectionTimeoutMS: 1000 })
    ).rejects.toThrow();
  }, 10000);
});
