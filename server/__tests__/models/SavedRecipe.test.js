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

const SavedRecipe = require('../../models/SavedRecipe');

describe('SavedRecipe Model', () => {
  const userId = new mongoose.Types.ObjectId();

  const validRecipe = {
    userId,
    title: 'Chicken Fried Rice',
    image: 'https://example.com/cfr.jpg',
    source: 'spoonacular',
    sourceId: '12345',
    instructions: 'Cook the rice. Fry the chicken.',
    ingredients: ['chicken', 'rice', 'soy sauce'],
    cookTime: 30,
    servings: 4,
    tags: ['kid-friendly'],
    nutrition: { calories: 450, protein: 30, carbs: 50, fat: 12 },
  };

  test('creates a saved recipe with all required fields', async () => {
    const recipe = await SavedRecipe.create(validRecipe);
    expect(recipe.userId.toString()).toBe(userId.toString());
    expect(recipe.title).toBe('Chicken Fried Rice');
    expect(recipe.source).toBe('spoonacular');
    expect(recipe.ingredients).toEqual(['chicken', 'rice', 'soy sauce']);
  });

  test('source only accepts "spoonacular" or "ai"', async () => {
    await expect(
      SavedRecipe.create({ ...validRecipe, source: 'invalid' })
    ).rejects.toThrow();
  });

  test('nutrition sub-document has calories, protein, carbs, fat', async () => {
    const recipe = await SavedRecipe.create(validRecipe);
    expect(recipe.nutrition.calories).toBe(450);
    expect(recipe.nutrition.protein).toBe(30);
    expect(recipe.nutrition.carbs).toBe(50);
    expect(recipe.nutrition.fat).toBe(12);
  });

  test('tags defaults to empty array', async () => {
    const { tags, ...noTags } = validRecipe;
    const recipe = await SavedRecipe.create(noTags);
    expect(recipe.tags).toEqual([]);
  });

  test('savedAt defaults to now', async () => {
    const recipe = await SavedRecipe.create(validRecipe);
    expect(recipe.savedAt).toBeInstanceOf(Date);
    expect(Date.now() - recipe.savedAt.getTime()).toBeLessThan(5000);
  });

  test('sourceId is optional (null for AI recipes)', async () => {
    const recipe = await SavedRecipe.create({
      ...validRecipe,
      source: 'ai',
      sourceId: null,
    });
    expect(recipe.sourceId).toBeNull();
  });

  test('user can save multiple recipes', async () => {
    await SavedRecipe.create(validRecipe);
    await SavedRecipe.create({ ...validRecipe, title: 'Garlic Rice', sourceId: '99999' });
    const count = await SavedRecipe.countDocuments({ userId });
    expect(count).toBe(2);
  });
});
