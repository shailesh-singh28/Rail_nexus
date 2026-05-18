const mongoose = require('mongoose');

const majorSectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Major section name is required'],
      trim: true
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division',
      required: [true, 'Division is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

majorSectionSchema.index({ division: 1 });

module.exports = mongoose.model('MajorSection', majorSectionSchema);
