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

describe('User Model — Preference Fields', () => {
  const validUser = {
    googleId: 'pref-test-123',
    email: 'pref@example.com',
    name: 'Pref User',
  };

  test('budgetGoal defaults to "medium"', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.budgetGoal).toBe('medium');
  });

  test('cookingSkill defaults to "intermediate"', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.cookingSkill).toBe('intermediate');
  });

  test('householdType defaults to "family-small"', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.householdType).toBe('family-small');
  });

  test('onboardingComplete defaults to false', async () => {
    const user = await User.create(validUser);
    expect(user.preferences.onboardingComplete).toBe(false);
  });

  test('accepts valid budgetGoal values', async () => {
    for (const value of ['low', 'medium', 'high']) {
      const user = await User.create({
        ...validUser,
        googleId: `budget-${value}`,
        preferences: { budgetGoal: value },
      });
      expect(user.preferences.budgetGoal).toBe(value);
    }
  });

  test('rejects invalid budgetGoal value', async () => {
    await expect(
      User.create({ ...validUser, preferences: { budgetGoal: 'extreme' } })
    ).rejects.toThrow(/budgetGoal/);
  });

  test('accepts valid cookingSkill values', async () => {
    for (const value of ['beginner', 'intermediate', 'advanced']) {
      const user = await User.create({
        ...validUser,
        googleId: `skill-${value}`,
        preferences: { cookingSkill: value },
      });
      expect(user.preferences.cookingSkill).toBe(value);
    }
  });

  test('rejects invalid cookingSkill value', async () => {
    await expect(
      User.create({ ...validUser, preferences: { cookingSkill: 'master' } })
    ).rejects.toThrow(/cookingSkill/);
  });

  test('accepts valid householdType values', async () => {
    for (const value of ['single', 'couple', 'family-small', 'family-large']) {
      const user = await User.create({
        ...validUser,
        googleId: `household-${value}`,
        preferences: { householdType: value },
      });
      expect(user.preferences.householdType).toBe(value);
    }
  });

  test('rejects invalid householdType value', async () => {
    await expect(
      User.create({ ...validUser, preferences: { householdType: 'commune' } })
    ).rejects.toThrow(/householdType/);
  });

  test('can update all preference fields together', async () => {
    const user = await User.create(validUser);
    user.preferences.budgetGoal = 'low';
    user.preferences.cookingSkill = 'beginner';
    user.preferences.householdType = 'couple';
    user.preferences.onboardingComplete = true;
    await user.save();

    const updated = await User.findById(user._id);
    expect(updated.preferences.budgetGoal).toBe('low');
    expect(updated.preferences.cookingSkill).toBe('beginner');
    expect(updated.preferences.householdType).toBe('couple');
    expect(updated.preferences.onboardingComplete).toBe(true);
  });
});
