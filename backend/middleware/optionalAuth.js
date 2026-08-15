const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Optional authentication middleware.
 * Attaches `req.user` when a valid Bearer token is provided, but never
 * rejects the request (used for guest-friendly routes like the chat).
 */
exports.optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
  } catch (err) {
    // Invalid/expired token - just treat as anonymous
    req.user = null;
  }

  next();
};
