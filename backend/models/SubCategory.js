const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sub-category name is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

subCategorySchema.index({ category: 1 });

module.exports = mongoose.model('SubCategory', subCategorySchema);
