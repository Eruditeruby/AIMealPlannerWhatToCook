export const HOUSEHOLD_OPTIONS = [
  { value: 'single', label: 'Just me', emoji: '🧑' },
  { value: 'couple', label: 'Two of us', emoji: '👫' },
  { value: 'family-small', label: 'Family (3-4)', emoji: '👨‍👩‍👧' },
  { value: 'family-large', label: 'Family (5+)', emoji: '👨‍👩‍👧‍👦' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'low', label: 'Budget-friendly', emoji: '💰' },
  { value: 'medium', label: 'Moderate', emoji: '💵' },
  { value: 'high', label: 'No limit', emoji: '✨' },
] as const;

export const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten-free', label: 'Gluten-free', emoji: '🌾' },
  { value: 'dairy-free', label: 'Dairy-free', emoji: '🥛' },
  { value: 'nut-free', label: 'Nut-free', emoji: '🥜' },
] as const;
