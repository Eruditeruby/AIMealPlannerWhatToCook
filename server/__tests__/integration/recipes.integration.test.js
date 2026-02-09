/**
 * Integration tests for complete recipe workflow
 * Tests Auth → Recipe suggestions → Details → Save → Favorites
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../index');
const User = require('../../models/User');
const SavedRecipe = require('../../models/SavedRecipe');
const { generateToken } = require('../../utils/token');

// Mock external APIs
jest.mock('../../services/spoonacular');
jest.mock('../../services/openrouter');

const spoonacularService = require('../../services/spoonacular');
const openrouterService = require('../../services/openrouter');

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
  await SavedRecipe.deleteMany({});

  testUser = await User.create({
    googleId: 'google-recipe-test',
    email: 'recipe@example.com',
    name: 'Recipe Test User'
  });
  authToken = generateToken(testUser);

  // Ensure indexes are built
  await SavedRecipe.ensureIndexes();

  // Reset mocks
  jest.clearAllMocks();
});

afterEach(async () => {
  await User.deleteMany({});
  await SavedRecipe.deleteMany({});
});

describe('Recipe Integration Flow', () => {
  describe('Complete Recipe Workflow', () => {
    it('should handle full recipe flow: suggest → detail → save → retrieve favorites', async () => {
      // Mock Spoonacular responses
      const mockSuggestions = [
        { id: 1, title: 'Chicken Rice', image: 'image1.jpg', usedIngredients: ['chicken', 'rice'] },
        { id: 2, title: 'Tomato Chicken', image: 'image2.jpg', usedIngredients: ['chicken', 'tomatoes'] },
        { id: 3, title: 'Rice Bowl', image: 'image3.jpg', usedIngredients: ['rice'] }
      ];

      const mockRecipeDetail = {
        id: 1,
        title: 'Chicken Rice',
        image: 'image1.jpg',
        servings: 4,
        readyInMinutes: 30,
        instructions: '<ol><li>Cook rice</li><li>Grill chicken</li></ol>',
        extendedIngredients: [
          { original: '2 cups rice' },
          { original: '500g chicken breast' }
        ],
        nutrition: {
          nutrients: [
            { name: 'Calories', amount: 450, unit: 'kcal' },
            { name: 'Protein', amount: 35, unit: 'g' },
            { name: 'Carbohydrates', amount: 50, unit: 'g' },
            { name: 'Fat', amount: 10, unit: 'g' }
          ]
        }
      };

      spoonacularService.searchRecipes = jest.fn().mockResolvedValue(mockSuggestions);
      spoonacularService.getRecipeDetails = jest.fn().mockResolvedValue(mockRecipeDetail);

      // Step 1: Get recipe suggestions
      let response = await request(app)
        .get('/api/recipes/suggest?ingredients=chicken,rice,tomatoes')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.recipes).toHaveLength(3);
      expect(response.body.recipes[0].title).toBe('Chicken Rice');

      // Step 2: Get recipe details
      response = await request(app)
        .get('/api/recipes/1')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body.title).toBe('Chicken Rice');
      expect(response.body.instructions).toContain('Cook rice');

      // Step 3: Save recipe to favorites
      response = await request(app)
        .post('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .send({
          sourceId: '1',
          title: 'Chicken Rice',
          image: 'image1.jpg',
          source: 'spoonacular',
          ingredients: ['2 cups rice', '500g chicken breast'],
          instructions: 'Cook rice. Grill chicken.',
          cookTime: 30,
          servings: 4,
          tags: ['chicken', 'rice'],
          nutrition: {
            calories: 450,
            protein: 35,
            carbs: 50,
            fat: 10
          }
        })
        .expect(201);

      expect(response.body.title).toBe('Chicken Rice');

      // Step 4: Retrieve favorites
      response = await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Chicken Rice');

      // Step 5: Delete from favorites
      const savedRecipeId = response.body[0]._id;
      await request(app)
        .delete(`/api/recipes/saved/${savedRecipeId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      // Step 6: Verify deletion
      response = await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('Recipe Fallback Behavior', () => {
    it('should fallback to OpenRouter when Spoonacular returns < 3 results', async () => {
      // Mock Spoonacular with insufficient results
      spoonacularService.searchRecipes = jest.fn().mockResolvedValue([
        { id: 1, title: 'Recipe 1', image: 'img1.jpg', usedIngredients: ['chicken'] }
      ]);

      // Mock OpenRouter AI fallback
      const mockAIRecipes = [
        { title: 'AI Recipe 1', ingredients: ['chicken', 'rice'], instructions: 'AI instructions 1' },
        { title: 'AI Recipe 2', ingredients: ['chicken', 'tomatoes'], instructions: 'AI instructions 2' }
      ];
      openrouterService.suggestRecipes = jest.fn().mockResolvedValue(mockAIRecipes);

      const response = await request(app)
        .get('/api/recipes/suggest?ingredients=chicken,rice,tomatoes')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      // Should include both Spoonacular + AI results
      expect(response.body.recipes.length).toBeGreaterThanOrEqual(3);
      expect(openrouterService.suggestRecipes).toHaveBeenCalledWith(
        ['chicken', 'rice', 'tomatoes'],
        expect.any(Object)
      );
    });

    it('should handle both API failures gracefully', async () => {
      // Mock both APIs failing
      spoonacularService.searchRecipes = jest.fn().mockRejectedValue(new Error('Spoonacular error'));
      spoonacularService.findByIngredients = jest.fn().mockRejectedValue(new Error('Spoonacular fallback error'));
      openrouterService.suggestRecipes = jest.fn().mockRejectedValue(new Error('OpenRouter error'));

      const response = await request(app)
        .get('/api/recipes/suggest?ingredients=chicken')
        .set('Cookie', [`token=${authToken}`])
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Saved Recipes Isolation', () => {
    it('should isolate saved recipes between users', async () => {
      // User 1: Save a recipe
      const recipe1 = {
        sourceId: '1',
        title: 'User 1 Recipe',
        image: 'img1.jpg',
        source: 'spoonacular',
        ingredients: ['chicken'],
        instructions: 'Cook chicken',
        cookTime: 20,
        servings: 2
      };

      await request(app)
        .post('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .send(recipe1)
        .expect(201);

      // User 2: Create and authenticate
      const user2 = await User.create({
        googleId: 'google-recipe-test-2',
        email: 'recipe2@example.com',
        name: 'Recipe Test User 2'
      });
      const token2 = generateToken(user2);

      // User 2: Should have empty favorites
      let response = await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${token2}`])
        .expect(200);

      expect(response.body).toHaveLength(0);

      // User 2: Save a different recipe
      const recipe2 = {
        sourceId: '2',
        title: 'User 2 Recipe',
        image: 'img2.jpg',
        source: 'spoonacular',
        ingredients: ['pasta'],
        instructions: 'Cook pasta',
        cookTime: 15,
        servings: 1
      };

      await request(app)
        .post('/api/recipes/saved')
        .set('Cookie', [`token=${token2}`])
        .send(recipe2)
        .expect(201);

      // User 1: Should only see their recipe
      response = await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('User 1 Recipe');

      // User 2: Should only see their recipe
      response = await request(app)
        .get('/api/recipes/saved')
        .set('Cookie', [`token=${token2}`])
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('User 2 Recipe');
    });
  });

  describe('Recipe Error Scenarios', () => {
    it('should reject recipe operations without authentication', async () => {
      await request(app)
        .get('/api/recipes/suggest?ingredients=chicken')
        .expect(401);

      await request(app)
        .get('/api/recipes/1')
        .expect(401);

      await request(app)
        .get('/api/recipes/saved')
        .expect(401);

      await request(app)
        .post('/api/recipes/saved')
        .send({ title: 'Recipe' })
        .expect(401);
    });

    it('should prevent duplicate recipe saves', async () => {
      const recipe = {
        sourceId: '1',
        title: 'Chicken Rice',
        image: 'img.jpg',
        source: 'spoonacular',
        ingredients: ['chicken', 'rice'],
        instructions: 'Cook',
        cookTime: 30,
        servings: 4
      };

      // Save first time - should succeed
      await request(app)
        .post('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .send(recipe)
        .expect(201);

      // Save again - should fail (duplicate)
      await request(app)
        .post('/api/recipes/saved')
        .set('Cookie', [`token=${authToken}`])
        .send(recipe)
        .expect(409);
    });
  });
});
