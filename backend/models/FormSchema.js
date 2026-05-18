const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['text', 'number', 'select', 'textarea', 'date', 'checkbox']
    },
    options: [{ type: String, trim: true }], // for select fields
    required: { type: Boolean, default: false },
    placeholder: { type: String, trim: true },
    unit: { type: String, trim: true } // e.g. "Ω", "dBm", "MHz"
  },
  { _id: false }
);

const formSchemaSchema = new mongoose.Schema(
  {
    parameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parameter',
      required: [true, 'Parameter is required'],
      unique: true
    },
    fields: {
      type: [fieldSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Form schema must have at least one field'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FormSchema', formSchemaSchema);
