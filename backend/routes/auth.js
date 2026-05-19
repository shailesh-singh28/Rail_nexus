const express = require('express');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Initialize Twilio client if credentials exist in env
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

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
    user.otpCode = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Send SMS via Procom Solution or Twilio if configured
    let smsSent = false;
    let gatewayUsed = 'None';

    if (process.env.SMS_ENABLED === 'true' && process.env.SMS_API_URL) {
      try {
        const smsMessage = `Your OTP for RailNexus login is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone. - STSECR`;
        
        // Build the request query parameters for Procom Solution
        const queryParams = new URLSearchParams({
          username: process.env.SMS_USERNAME || '',
          api_password: process.env.SMS_API_PASSWORD || '',
          sender: process.env.SMS_SENDER_ID || '',
          to: '91' + cleaned, // Standard parameter (with Indian 91 country code prefix)
          mobile: cleaned, // Fallback parameter
          mobiles: cleaned, // Fallback 2
          receiver: cleaned, // Fallback 3
          message: smsMessage,
          priority: process.env.SMS_PRIORITY || '11',
          entityid: process.env.SMS_ENTITY_ID || '',
          entity_id: process.env.SMS_ENTITY_ID || ''
        });

        // Add unicode parameter only for non-English (Unicode) messages
        // Do NOT send unicode=0 — some gateways reject it; omitting it defaults to plain text
        if (process.env.SMS_UNICODE && process.env.SMS_UNICODE !== '0') {
          queryParams.append('unicode', process.env.SMS_UNICODE);
        }

        // Add DLT Template ID variations to be completely bulletproof
        if (process.env.SMS_TEMPLATE_ID) {
          queryParams.append('tempid', process.env.SMS_TEMPLATE_ID);
          queryParams.append('templateid', process.env.SMS_TEMPLATE_ID);
          queryParams.append('template_id', process.env.SMS_TEMPLATE_ID);
          queryParams.append('dlt_template_id', process.env.SMS_TEMPLATE_ID);
          queryParams.append('dlt_templateid', process.env.SMS_TEMPLATE_ID);
        }

        const fullUrl = `${process.env.SMS_API_URL}?${queryParams.toString()}`;
        console.log(`📡 Sending SMS via Procom Solution to +91${cleaned}...`);
        console.log(`📡 Request URL: ${fullUrl}`);
        
        const smsRes = await fetch(fullUrl, { method: 'GET' });
        const smsTextResponse = await smsRes.text();
        
        console.log(`📱 Procom Solution HTTP Status: ${smsRes.status}`);
        console.log(`📱 Procom Solution Response: "${smsTextResponse}"`);

        // Most SMS gateways return a numeric ID or "success" on success
        // and "error", "fail", or negative number on failure
        const isError = /error|fail|invalid|unauthorized|denied/i.test(smsTextResponse)
          || smsTextResponse.trim().startsWith('-');

        if (isError) {
          console.error(`❌ SMS gateway returned error: ${smsTextResponse}`);
          throw new Error(`SMS gateway error: ${smsTextResponse}`);
        }

        smsSent = true;
        gatewayUsed = 'Procom Solution';
      } catch (smsError) {
        console.error('❌ Failed to send SMS via Procom Solution:', smsError.message);
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ error: 'Failed to send SMS OTP via gateway. Please try again.' });
        }
      }
    } else if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your RailNexus OTP verification code is: ${otp}. It is valid for 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${cleaned}`
        });
        console.log(`📱 Real OTP sent successfully via Twilio to +91${cleaned}`);
        smsSent = true;
        gatewayUsed = 'Twilio';
      } catch (smsError) {
        console.error('❌ Failed to send SMS via Twilio:', smsError.message);
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ error: 'Failed to send SMS OTP. Please try again.' });
        }
      }
    }

    const response = { message: `OTP sent to +91 ${cleaned}` };

    // In development mode, auto-fill only if SMS was NOT sent
    if (process.env.NODE_ENV === 'development') {
      if (!smsSent) {
        response.otp = otp; // Returned to frontend for auto-fill in simulator mode
      }
      console.log(`\n\n========================================`);
      console.log(`🔔 REAL-TIME OTP GENERATED FOR +91 ${cleaned}`);
      console.log(`🔑 OTP CODE: ${otp}`);
      console.log(`📡 SMS Status: ${smsSent ? 'SENT' : 'NOT CONFIGURED (Simulated)'}`);
      console.log(`🔌 Active Gateway: ${gatewayUsed}`);
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

// ── POST /api/auth/register ───────────────────────────────
// Register a new user (generates user/admin ID)
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, division } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    let cleanedPhone = undefined;
    if (phone) {
      cleanedPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanedPhone.length === 10) {
        const existingPhone = await User.findOne({ phone: cleanedPhone });
        if (existingPhone) {
          return res.status(400).json({ error: 'Phone number is already registered.' });
        }
      } else if (cleanedPhone.length > 0) {
        return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
      }
    }

    let userDivision = division;
    if (!userDivision) {
      const Division = require('../models/Division');
      const firstDiv = await Division.findOne();
      if (firstDiv) {
        userDivision = firstDiv._id;
      }
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone: cleanedPhone || undefined,
      password,
      role: role || 'engineer',
      division: userDivision
    });

    const token = signToken(newUser._id);
    res.status(201).json({
      message: `${role === 'admin' ? 'Admin' : 'User'} registered successfully.`,
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/request-access ────────────────────────
// Submit a guest account access request
router.post('/request-access', async (req, res) => {
  try {
    const { name, email, phone, division, password } = req.body;
    const AccessRequest = require('../models/AccessRequest');

    if (!name || !email || !phone || !division || !password) {
      return res.status(400).json({ error: 'All fields (name, email, phone, division, password) are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanedPhone.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
    }

    // Check if phone or email already registered
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: cleanedPhone }]
    });
    if (existingUser) {
      return res.status(400).json({ error: 'An active user account is already registered with this email or phone number.' });
    }

    // Check if there is already a pending request
    const existingRequest = await AccessRequest.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: cleanedPhone }],
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You have a pending request. Please wait for administrator approval.' });
    }

    const newRequest = await AccessRequest.create({
      name,
      email: email.toLowerCase(),
      phone: cleanedPhone,
      division,
      password
    });

    res.status(201).json({
      message: 'Access request submitted successfully. Administrator has been notified.',
      request: newRequest
    });
  } catch (err) {
    console.error('Access request error:', err);
    res.status(500).json({ error: 'Failed to submit request. Please try again.' });
  }
});

module.exports = router;
