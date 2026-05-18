const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true
    },
    majorSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MajorSection',
      required: [true, 'Major section is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

sectionSchema.index({ majorSection: 1 });

module.exports = mongoose.model('Section', sectionSchema);
