const jwt = require('jsonwebtoken');
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
