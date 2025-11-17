const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Card = require('../models/Card');
const Loan = require('../models/Loan');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .populate('account', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType')
      .populate('card', 'cardNumber cardType')
      .populate('loan', 'loanAmount purpose')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create a deposit transaction
// @route   POST /api/transactions/deposit
// @access  Private
exports.deposit = async (req, res, next) => {
  try {
    const { accountId, amount, description } = req.body;

    // Verify the account belongs to the user
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Update account balance
    account.balance += amount;
    await account.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      account: accountId,
      type: 'deposit',
      amount,
      description: description || 'Deposit',
      balance: account.balance,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a withdrawal transaction
// @route   POST /api/transactions/withdraw
// @access  Private
exports.withdraw = async (req, res, next) => {
  try {
    const { accountId, amount, description } = req.body;

    // Verify the account belongs to the user
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Check sufficient balance
    if (account.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    // Update account balance
    account.balance -= amount;
    await account.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      account: accountId,
      type: 'withdrawal',
      amount,
      description: description || 'Withdrawal',
      balance: account.balance,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Transfer between accounts
// @route   POST /api/transactions/transfer
// @access  Private
exports.transfer = async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    // Verify both accounts belong to the user
    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user.id });
    const toAccount = await Account.findOne({ _id: toAccountId, user: req.user.id });

    if (!fromAccount || !toAccount) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Check sufficient balance
    if (fromAccount.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient balance' });
    }

    // Update account balances
    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save();
    await toAccount.save();

    // Create transaction records
    const fromTransaction = await Transaction.create({
      user: req.user.id,
      account: fromAccountId,
      toAccount: toAccountId,
      type: 'transfer',
      amount,
      description: description || 'Transfer',
      balance: fromAccount.balance,
    });

    const toTransaction = await Transaction.create({
      user: req.user.id,
      account: toAccountId,
      type: 'transfer',
      amount,
      description: description || 'Transfer received',
      balance: toAccount.balance,
    });

    res.status(201).json({
      success: true,
      data: { fromTransaction, toTransaction },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
