const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      trim: true
    },
    testType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestType',
      required: [true, 'Test type is required']
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

parameterSchema.index({ testType: 1 });

module.exports = mongoose.model('Parameter', parameterSchema);
