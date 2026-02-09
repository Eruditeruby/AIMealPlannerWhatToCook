const DIET_MAP = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
};

const INTOLERANCE_MAP = {
  'gluten-free': 'gluten',
  'dairy-free': 'dairy',
  'nut-free': 'tree nut',
};

function mapDietaryRestrictions(restrictions = []) {
  const diets = restrictions.filter((r) => DIET_MAP[r]).map((r) => DIET_MAP[r]);
  const intolerances = restrictions.filter((r) => INTOLERANCE_MAP[r]).map((r) => INTOLERANCE_MAP[r]);

  return {
    diet: diets.join(',') || undefined,
    intolerances: intolerances.join(',') || undefined,
  };
}

module.exports = { mapDietaryRestrictions };
