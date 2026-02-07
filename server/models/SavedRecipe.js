const mongoose = require('mongoose');

const savedRecipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    enum: ['spoonacular', 'ai'],
    required: true,
  },
  sourceId: {
    type: String,
    default: null,
  },
  instructions: {
    type: String,
    default: '',
  },
  ingredients: {
    type: [String],
    required: true,
  },
  cookTime: {
    type: Number,
    default: null,
  },
  servings: {
    type: Number,
    default: null,
  },
  tags: {
    type: [String],
    default: [],
  },
  nutrition: {
    calories: { type: Number, default: null },
    protein: { type: Number, default: null },
    carbs: { type: Number, default: null },
    fat: { type: Number, default: null },
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

savedRecipeSchema.index({ userId: 1, savedAt: -1 });

module.exports = mongoose.model('SavedRecipe', savedRecipeSchema);
