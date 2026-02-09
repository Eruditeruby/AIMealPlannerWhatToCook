const { mapDietaryRestrictions } = require('../../utils/dietaryMapper');

describe('dietaryMapper', () => {
  describe('mapDietaryRestrictions', () => {
    test('maps vegetarian to diet param', () => {
      const result = mapDietaryRestrictions(['vegetarian']);
      expect(result).toEqual({ diet: 'vegetarian', intolerances: undefined });
    });

    test('maps vegan to diet param', () => {
      const result = mapDietaryRestrictions(['vegan']);
      expect(result).toEqual({ diet: 'vegan', intolerances: undefined });
    });

    test('maps gluten-free to intolerances param', () => {
      const result = mapDietaryRestrictions(['gluten-free']);
      expect(result).toEqual({ diet: undefined, intolerances: 'gluten' });
    });

    test('maps dairy-free to intolerances param', () => {
      const result = mapDietaryRestrictions(['dairy-free']);
      expect(result).toEqual({ diet: undefined, intolerances: 'dairy' });
    });

    test('maps nut-free to intolerances param', () => {
      const result = mapDietaryRestrictions(['nut-free']);
      expect(result).toEqual({ diet: undefined, intolerances: 'tree nut' });
    });

    test('maps combo of diet + intolerances', () => {
      const result = mapDietaryRestrictions(['vegetarian', 'gluten-free', 'dairy-free']);
      expect(result).toEqual({ diet: 'vegetarian', intolerances: 'gluten,dairy' });
    });

    test('returns undefined for both when empty array', () => {
      const result = mapDietaryRestrictions([]);
      expect(result).toEqual({ diet: undefined, intolerances: undefined });
    });

    test('returns undefined for both when undefined input', () => {
      const result = mapDietaryRestrictions();
      expect(result).toEqual({ diet: undefined, intolerances: undefined });
    });

    test('ignores unknown restriction values', () => {
      const result = mapDietaryRestrictions(['pescatarian', 'keto']);
      expect(result).toEqual({ diet: undefined, intolerances: undefined });
    });

    test('handles multiple diets (comma-separated)', () => {
      const result = mapDietaryRestrictions(['vegetarian', 'vegan']);
      expect(result.diet).toBe('vegetarian,vegan');
    });
  });
});
