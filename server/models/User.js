const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format',
    },
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  preferences: {
    dietaryRestrictions: {
      type: [String],
      default: [],
    },
    familySize: {
      type: Number,
      default: null,
    },
    budgetGoal: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    cookingSkill: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    householdType: {
      type: String,
      enum: ['single', 'couple', 'family-small', 'family-large'],
      default: 'family-small',
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
