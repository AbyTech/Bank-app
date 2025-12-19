const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Card = require('../models/Card');
const Loan = require('../models/Loan');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -seedPhrase');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -seedPhrase');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password -seedPhrase');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userId = user._id;

    // Delete all associated data
    await Account.deleteMany({ user: userId });
    await Transaction.deleteMany({ user: userId });
    await Card.deleteMany({ user: userId });
    await Loan.deleteMany({ user: userId });

    // Now delete the user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get user details with accounts, transactions, cards, loans
// @route   GET /api/users/:id/details
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Get user basic info
    const user = await User.findById(userId).select('-password -seedPhrase');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user's accounts
    const accounts = await Account.find({ user: userId });

    // Get user's transactions (last 10)
    const transactions = await Transaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's cards
    const cards = await Card.find({ user: userId });

    // Get user's loans
    const loans = await Loan.find({ user: userId });

    res.status(200).json({
      success: true,
      data: {
        user,
        accounts,
        transactions,
        cards,
        loans
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update user balance
// @route   PUT /api/users/:id/balance
// @access  Private/Admin
exports.updateUserBalance = async (req, res, next) => {
  try {
    const { balance, description } = req.body;
    const userId = req.params.id;

    // Find the user's account
    const account = await Account.findOne({ user: userId });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found for this user' });
    }

    const oldBalance = account.balance;
    account.balance = balance;

    await account.save();

    // Create a transaction to log the admin update
    await Transaction.create({
      user: userId,
      account: account._id,
      type: 'admin',
      amount: balance - oldBalance,
      description: description || 'Administrative balance update',
      balance: balance,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

