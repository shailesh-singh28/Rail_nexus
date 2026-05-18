const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Division name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Division', divisionSchema);
