const mongoose = require('mongoose');

const cookingLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipeTitle: {
    type: String,
    required: true,
  },
  ingredientsUsed: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length > 0,
      message: 'At least one ingredient is required',
    },
  },
  estimatedSavings: {
    type: Number,
    required: true,
  },
  cookedAt: {
    type: Date,
    default: Date.now,
  },
});

cookingLogSchema.index({ userId: 1, cookedAt: -1 });

module.exports = mongoose.model('CookingLog', cookingLogSchema);
