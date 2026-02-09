const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['vegetable', 'fruit', 'protein', 'dairy', 'grain', 'pantry-staple', 'other'],
      default: 'other',
    },
    perishable: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const pantrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: {
      type: [pantryItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pantry', pantrySchema);
