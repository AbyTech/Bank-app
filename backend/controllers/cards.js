const Card = require('../models/Card');
const Account = require('../models/Account');

// @desc    Get all cards for a user
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user.id }).populate('account', 'accountNumber accountType');

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Order a new card
// @route   POST /api/cards/order-card
// @access  Private
exports.orderCard = async (req, res, next) => {
  try {
    const { card_type, amount } = req.body;

    // Get user's checking account
    const account = await Account.findOne({ user: req.user.id, accountType: 'checking' });
    if (!account) {
      return res.status(404).json({ success: false, error: 'No checking account found' });
    }

    // Generate card details
    const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4); // 4 years from now
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    const card = await Card.create({
      user: req.user.id,
      account: account._id,
      cardNumber,
      cardType: card_type,
      expiryDate,
      cvv,
      cardName: `${card_type.charAt(0).toUpperCase() + card_type.slice(1)} Card`,
      status: 'pending_payment',
      purchaseStatus: 'pending_payment',
      purchaseAmount: amount,
      paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Create a new card
// @route   POST /api/cards
// @access  Private
exports.createCard = async (req, res, next) => {
  try {
    const { accountId, cardType } = req.body;

    // Verify the account belongs to the user
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Generate card details
    const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4); // 4 years from now
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    const card = await Card.create({
      user: req.user.id,
      account: accountId,
      cardNumber,
      cardType: cardType || 'debit',
      expiryDate,
      cvv,
    });

    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
