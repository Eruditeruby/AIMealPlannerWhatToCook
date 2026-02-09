const { INGREDIENT_META, getIngredientMeta } = require('../../data/ingredientMeta');

describe('Ingredient Metadata', () => {
  test('has metadata for common vegetables', () => {
    const vegs = ['tomato', 'spinach', 'broccoli', 'carrot', 'onion'];
    for (const veg of vegs) {
      const meta = getIngredientMeta(veg);
      expect(meta.category).toBe('vegetable');
      expect(meta.perishable).toBe(true);
    }
  });

  test('has metadata for common proteins', () => {
    const proteins = ['chicken breast', 'salmon', 'ground beef', 'shrimp', 'tofu'];
    for (const protein of proteins) {
      const meta = getIngredientMeta(protein);
      expect(meta.category).toBe('protein');
      expect(meta.perishable).toBe(true);
    }
  });

  test('has metadata for dairy products', () => {
    const dairy = ['milk', 'butter', 'yogurt', 'cheddar cheese'];
    for (const d of dairy) {
      const meta = getIngredientMeta(d);
      expect(meta.category).toBe('dairy');
      expect(meta.perishable).toBe(true);
    }
  });

  test('grains and dry pasta are not perishable', () => {
    const grains = ['spaghetti', 'white rice', 'quinoa', 'oats'];
    for (const g of grains) {
      const meta = getIngredientMeta(g);
      expect(meta.category).toBe('grain');
      expect(meta.perishable).toBe(false);
    }
  });

  test('pantry staples are not perishable', () => {
    const staples = ['soy sauce', 'olive oil', 'salt', 'honey', 'vinegar'];
    for (const s of staples) {
      const meta = getIngredientMeta(s);
      expect(meta.category).toBe('pantry-staple');
      expect(meta.perishable).toBe(false);
    }
  });

  test('returns default for unknown ingredients', () => {
    const meta = getIngredientMeta('mystery food');
    expect(meta.category).toBe('other');
    expect(meta.perishable).toBe(false);
    expect(meta.shelfLifeDays).toBe(365);
  });

  test('lookup is case-insensitive', () => {
    const meta = getIngredientMeta('SPINACH');
    expect(meta.category).toBe('vegetable');
    expect(meta.perishable).toBe(true);
  });

  test('lookup trims whitespace', () => {
    const meta = getIngredientMeta('  tomato  ');
    expect(meta.category).toBe('vegetable');
  });

  test('bread products are perishable grains', () => {
    const breads = ['bread', 'bagel', 'naan', 'sourdough'];
    for (const b of breads) {
      const meta = getIngredientMeta(b);
      expect(meta.category).toBe('grain');
      expect(meta.perishable).toBe(true);
    }
  });

  test('covers at least 300 ingredients', () => {
    expect(Object.keys(INGREDIENT_META).length).toBeGreaterThanOrEqual(300);
  });

  test('all entries have required fields', () => {
    for (const [name, meta] of Object.entries(INGREDIENT_META)) {
      expect(meta).toHaveProperty('category');
      expect(meta).toHaveProperty('perishable');
      expect(meta).toHaveProperty('shelfLifeDays');
      expect(typeof meta.perishable).toBe('boolean');
      expect(typeof meta.shelfLifeDays).toBe('number');
      expect(meta.shelfLifeDays).toBeGreaterThan(0);
    }
  });
});
