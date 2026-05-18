const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address']
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone must be 10 digits']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'engineer', 'viewer'],
      default: 'engineer'
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Division'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    // OTP fields (temporary, cleared after use)
    otpCode: { type: String, select: false },
    otpExpiry: { type: Date, select: false }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
