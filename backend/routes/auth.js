const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

// ── POST /api/auth/login ──────────────────────────────────
// Email + password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'This account uses OTP login. Please use the OTP tab.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── POST /api/auth/send-otp ───────────────────────────────
// Request OTP for phone login
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);

    if (cleaned.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
    }

    const user = await User.findOne({ phone: cleaned });
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'No account found for this number. Contact administrator.' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in user document with 5-minute expiry
    // In production: send via SMS gateway (Twilio, MSG91, etc.)
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // TODO: Integrate SMS gateway here
    // await smsService.send(cleaned, `Your RailNexus OTP is: ${otp}`);

    // In development, return OTP in response for testing
    const response = { message: `OTP sent to +91 ${cleaned}` };
    if (process.env.NODE_ENV === 'development') {
      response.otp = otp; // Remove in production
      console.log(`\n\n========================================`);
      console.log(`🔔 REAL-TIME OTP GENERATED FOR ${cleaned}`);
      console.log(`🔑 OTP CODE: ${otp}`);
      console.log(`========================================\n\n`);
    }

    res.json(response);
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────
// Verify OTP and return JWT
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);

    if (!cleaned || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }

    const user = await User.findOne({ phone: cleaned }).select('+otpCode +otpExpiry');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid phone number.' });
    }

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ error: 'No OTP requested. Please request a new OTP.' });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (user.otpCode !== otp.toString()) {
      return res.status(401).json({ error: 'Incorrect OTP. Please try again.' });
    }

    // Clear OTP after successful verification
    user.otpCode = undefined;
    user.otpExpiry = undefined;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'OTP verification failed. Please try again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
// Get current user from token (used to restore session on page refresh)
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
