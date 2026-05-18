const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MainCategory',
      required: [true, 'Main category is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

categorySchema.index({ mainCategory: 1 });

module.exports = mongoose.model('Category', categorySchema);
