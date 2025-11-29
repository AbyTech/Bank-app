const Account = require('../models/Account');
const User = require('../models/User');

// @desc    Get recipient name from account number
// @route   GET /api/accounts/recipient/:accountNumber
// @access  Private
exports.getRecipient = async (req, res, next) => {
  try {
    const account = await Account.findOne({ accountNumber: req.params.accountNumber }).populate('user', 'name');

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: account.user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all accounts for a user
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Make sure user owns account
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a new account
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res, next) => {
  try {
    const { accountType, currency = 'USD' } = req.body;

    // Create account
    const account = await Account.create({
      user: req.user.id,
      accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
      accountType,
      currency,
    });

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
exports.updateAccount = async (req, res, next) => {
  try {
    let account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Make sure user owns account
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Make sure user owns account
    if (account.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    await account.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
