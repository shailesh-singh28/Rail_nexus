const express = require('express');
const User = require('../models/User');
const AccessRequest = require('../models/AccessRequest');
const { protect, restrict } = require('../middleware/auth');

const router = express.Router();

// Apply protect & restrict('admin') middleware to all routes in this router
router.use(protect);
router.use(restrict('admin'));

// ── GET /api/users ────────────────────────────────────────
// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({})
      .populate('division', 'name code')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── POST /api/users ───────────────────────────────────────
// Create user directly (Admin registration)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, password, role, division } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }

    const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanedPhone.length !== 10) {
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: cleanedPhone }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email or phone is already registered.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: cleanedPhone,
      password,
      role: role || 'engineer',
      division
    });

    res.status(201).json(user);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// ── PUT /api/users/:id ────────────────────────────────────
// Update user details
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, role, division, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (email) user.email = email.toLowerCase();
    if (name) user.name = name;
    if (role) user.role = role;
    if (division) user.division = division;
    if (isActive !== undefined) user.isActive = isActive;

    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
      if (cleanedPhone.length === 10) {
        user.phone = cleanedPhone;
      }
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      user.password = password;
    }

    await user.save({ validateBeforeSave: false });
    const updated = await User.findById(user._id).populate('division', 'name code');
    res.json(updated);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ── DELETE /api/users/:id ─────────────────────────────────
// Delete user
router.delete('/:id', async (req, res) => {
  try {
    // Avoid self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

// ── GET /api/users/requests ───────────────────────────────
// Get all guest registration access requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await AccessRequest.find({})
      .populate('division', 'name code')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch access requests.' });
  }
});

// ── POST /api/users/requests/:id/approve ──────────────────
// Approve an access request, automatically creating the User
router.post('/requests/:id/approve', async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Access request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request has already been ${request.status}.` });
    }

    // Verify user doesn't exist already
    const existingUser = await User.findOne({
      $or: [{ email: request.email }, { phone: request.phone }]
    });

    if (existingUser) {
      request.status = 'approved';
      await request.save();
      return res.status(400).json({ error: 'A user account with this email/phone already exists. Request marked as approved.' });
    }

    // Generate random secure password (since they will log in using OTP or can reset it)
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

    const newUser = await User.create({
      name: request.name,
      email: request.email,
      phone: request.phone,
      password: request.password,
      role: 'engineer',
      division: request.division
    });

    request.status = 'approved';
    await request.save();

    res.json({
      message: 'Request approved successfully and user account activated.',
      user: newUser
    });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: 'Failed to approve request.' });
  }
});

// ── POST /api/users/requests/:id/reject ───────────────────
// Reject access request
router.post('/requests/:id/reject', async (req, res) => {
  try {
    const request = await AccessRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Access request not found.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: `Request is already ${request.status}.` });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'Request rejected successfully.' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'Failed to reject request.' });
  }
});

module.exports = router;
