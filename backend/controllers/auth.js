const User = require('../models/User');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const bip39 = require('bip39');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, country, seed_phrase, password } = req.body;

  try {
    // Split the name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Generate username from email
    const username = email.split('@')[0];

    // Use the provided password
    // Generate seed phrase if not provided (for new signups), use provided for migration
    const seedPhrase = seed_phrase || bip39.generateMnemonic();

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      seedPhrase,
      country: country || null,
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
  const { email, seedPhrase, password } = req.body;

  // Validate email and at least one of seedPhrase or password
  if (!email || (!seedPhrase && !password)) {
    return res.status(400).json({ success: false, error: 'Please provide an email and either seed phrase or password' });
  }

  // Check for user
  const user = await User.findOne({ email }).select('+seedPhrase +password');

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  let isValid = false;

  // Check password if provided
  if (password && await user.matchPassword(password)) {
    isValid = true;
  }

  // Check seed phrase if provided and not already valid
  if (!isValid && seedPhrase && user.seedPhrase === seedPhrase.trim()) {
    isValid = true;
  }

  if (!isValid) {
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
