const User = require('../models/User');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const bip39 = require('bip39');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, country, seed_phrase } = req.body;

  try {
    // Split the name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate username from email
    const username = email.split('@')[0];

    // Generate a random password (user will use seed phrase for recovery)
    const password = Math.random().toString(36).slice(-12);

    // Use the provided seed phrase instead of generating a new one
    const seedPhrase = seed_phrase;

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      seedPhrase,
    });

    // Create a default checking account for the new user
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await Account.create({
      user: user._id,
      accountNumber,
      accountType: 'checking',
      balance: 0, // Start with a zero balance
    });

    // Important: In a real app, you would not send the seed phrase back directly
    // You would typically show it once and require the user to back it up.
    // For this project, we will return it for convenience.
    sendTokenResponse(user, 201, res, seedPhrase);
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, seedPhrase } = req.body;

  // Validate email & seed phrase
  if (!email || !seedPhrase) {
    return res.status(400).json({ success: false, error: 'Please provide an email and seed phrase' });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+seedPhrase');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Check if seed phrase matches
  if (user.seedPhrase !== seedPhrase.trim()) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  sendTokenResponse(user, 200, res);
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, seedPhrase = null) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const response = {
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profilePhoto: user.profilePhoto,
    },
  };

  if (seedPhrase) {
    response.seedPhrase = seedPhrase;
  }

  res.status(statusCode).json(response);
};
