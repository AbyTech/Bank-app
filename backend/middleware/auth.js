const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Set token from cookie (guarded - cookie-parser is not mounted)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

// Block financial operations for accounts that an admin has set to "inactive".
// Inactive users can still log in and view their dashboard/status, but they
// cannot move money, order cards or take loans until reactivated.
exports.requireActiveAccount = (req, res, next) => {
  if (req.user && req.user.accountStatus === 'inactive') {
    return res.status(403).json({
      success: false,
      error: 'Your account is currently inactive. Please contact support to reactivate your account.',
    });
  }
  next();
};

// Verify the user's transaction PIN before any money movement (deposits,
// withdrawals, transfers). The PIN is sent in the request body as
// `transactionPin`, stored hashed with bcrypt in the database, and never
// stored, logged or returned by the API.
exports.requireTransactionPin = async (req, res, next) => {
  try {
    const pin = String(req.body.transactionPin || '');
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'Transaction PIN is required (4 digits).',
      });
    }

    const user = await User.findById(req.user.id).select('+transactionPin');
    if (!user || !user.transactionPinSet || !user.transactionPin) {
      return res.status(400).json({
        success: false,
        error: 'No transaction PIN set. Please create one first.',
      });
    }

    const isMatch = await bcrypt.compare(pin, user.transactionPin);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid transaction PIN.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
};
