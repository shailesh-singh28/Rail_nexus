const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verifies JWT and attaches req.user
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Restrict to specific roles
 * Usage: restrict('admin', 'engineer')
 */
const restrict = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: `Access denied. Required role: ${roles.join(' or ')}`
    });
  }
  next();
};

module.exports = { protect, restrict };
