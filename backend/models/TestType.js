const mongoose = require('mongoose');

const testTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Test type name is required'],
      trim: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Sub-category is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

testTypeSchema.index({ subCategory: 1 });

module.exports = mongoose.model('TestType', testTypeSchema);
