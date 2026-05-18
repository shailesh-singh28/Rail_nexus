const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitting user is required']
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division',
      required: [true, 'Division is required']
    },
    majorSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MajorSection',
      required: [true, 'Major section is required']
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'Section is required']
    },
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MainCategory',
      required: [true, 'Main category is required']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Sub-category is required']
    },
    testType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestType',
      required: [true, 'Test type is required']
    },
    parameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parameter',
      required: [true, 'Parameter is required']
    },
    // Dynamic form data stored as key-value pairs
    formData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: [true, 'Form data is required']
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    remarks: { type: String, trim: true }
  },
  { timestamps: true }
);

// Indexes for common query patterns
reportSchema.index({ division: 1, createdAt: -1 });
reportSchema.index({ submittedBy: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ section: 1, parameter: 1 });

module.exports = mongoose.model('Report', reportSchema);
