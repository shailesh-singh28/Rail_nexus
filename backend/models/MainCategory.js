const mongoose = require('mongoose');

const mainCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Main category name is required'],
      unique: true,
      trim: true
    },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('MainCategory', mainCategorySchema);
