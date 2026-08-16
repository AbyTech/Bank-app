const Card = require('../models/Card');
const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const { cardCategories, getCategory } = require('../data/cardCategories');
const { expireOverdueCards } = require('../services/cardExpiration');

// Card PIN validation - 4 numeric digits, separate from the transaction PIN.
const CARD_PIN_REGEX = /^\d{4}$/;

// @desc    Get the configurable card categories & fees
// @route   GET /api/cards/categories
// @access  Private
exports.getCategories = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: cardCategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get all cards for a user
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res, next) => {
  try {
    // Lazily expire any pending applications older than 7 days so the user
    // always sees the correct Rejected state without waiting for the job.
    await expireOverdueCards();

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

// @desc    Apply for a new virtual or physical card (full application flow)
// @route   POST /api/cards/apply
// @access  Private
exports.applyForCard = async (req, res, next) => {
  try {
    const { type, category, cardPin, confirmCardPin, termsAccepted, deliveryInfo } = req.body;

    if (type !== 'virtual' && type !== 'physical') {
      return res.status(400).json({ success: false, error: 'Invalid card type. Choose virtual or physical.' });
    }

    const categoryConfig = getCategory(type, category);
    if (!categoryConfig) {
      return res.status(400).json({ success: false, error: 'Invalid card category selected.' });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({ success: false, error: 'You must agree to the Terms and Conditions to apply.' });
    }

    // Card PIN (separate from transaction PIN) - never stored in plaintext
    if (!CARD_PIN_REGEX.test(String(cardPin || '')) || !CARD_PIN_REGEX.test(String(confirmCardPin || ''))) {
      return res.status(400).json({ success: false, error: 'Card PIN must be exactly 4 digits.' });
    }
    if (String(cardPin) !== String(confirmCardPin)) {
      return res.status(400).json({ success: false, error: 'Card PINs do not match. Please try again.' });
    }

    // Physical cards require delivery information
    if (type === 'physical') {
      const d = deliveryInfo || {};
      const requiredFields = ['fullName', 'phone', 'country', 'state', 'city', 'address'];
      for (const field of requiredFields) {
        if (!d[field] || !String(d[field]).trim()) {
          return res.status(400).json({ success: false, error: `Delivery information is incomplete: ${field} is required.` });
        }
      }
    }

    // Prevent duplicate pending applications
    const existingPending = await Card.findOne({ user: req.user.id, approvalStatus: 'pending' });
    if (existingPending) {
      return res.status(400).json({
        success: false,
        error: 'You already have a pending card application. Please wait for it to be reviewed.',
      });
    }

    // Get the user's checking account. NOTE: the issuance fee is paid to the
    // bank externally (through another account / via support), so there is no
    // balance requirement to apply. The card is issued once payment is
    // confirmed (admin approval).
    const account = await Account.findOne({ user: req.user.id, accountType: 'checking' });
    if (!account) {
      return res.status(404).json({ success: false, error: 'No checking account found' });
    }

    const fee = categoryConfig.fee;

    // Hash the card PIN
    const salt = await bcrypt.genSalt(10);
    const hashedCardPin = await bcrypt.hash(String(cardPin), salt);

    // Create the card application
    const cardNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 4);
    const cvv = Math.floor(100 + Math.random() * 900).toString();

    const cardData = {
      user: req.user.id,
      account: account._id,
      cardNumber,
      expiryDate,
      cvv,
      cardName: `${categoryConfig.name} ${type === 'virtual' ? 'Virtual' : 'Physical'} Card`,
      cardType: 'debit',
      type,
      category: categoryConfig.id,
      fee,
      termsAccepted: true,
      status: 'pending',
      purchaseStatus: 'pending_approval',
      approvalStatus: 'pending',
      paymentDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      cardPin: hashedCardPin,
      cardPinSet: true,
    };

    if (type === 'physical') {
      cardData.deliveryInfo = {
        fullName: deliveryInfo.fullName.trim(),
        phone: deliveryInfo.phone.trim(),
        country: deliveryInfo.country.trim(),
        state: deliveryInfo.state.trim(),
        city: deliveryInfo.city.trim(),
        address: deliveryInfo.address.trim(),
        zipCode: (deliveryInfo.zipCode || '').trim(),
      };
    }

    const card = await Card.create(cardData);

    // Never expose the card PIN (even hashed) in API responses.
    card.cardPin = undefined;

    res.status(201).json({
      success: true,
      message: 'Card application submitted successfully.',
      data: card,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
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
      purchaseStatus: 'pending_approval',
      approvalStatus: 'pending',
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

// @desc    Approve or decline a card
// @route   PUT /api/cards/:id/approve
// @access  Private (Admin only)
exports.approveCard = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // 'approve' or 'decline'

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    if (card.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'This application has already been processed.' });
    }

    if (action === 'approve') {
      // NOTE: the issuance fee is paid to the bank externally (through another
      // account / via support) - it is NOT auto-charged from the account here.
      // The card is activated once the admin confirms the application.
      card.approvalStatus = 'approved';
      card.purchaseStatus = 'approved';
      card.status = 'active';
      card.approvalDate = new Date();
      card.approvedBy = req.user.id;
      // Clear any previous rejection data
      card.rejectionReason = undefined;
      card.rejectionDate = undefined;
      card.rejectedBy = undefined;
    } else if (action === 'decline') {
      card.approvalStatus = 'declined';
      card.purchaseStatus = 'declined';
      card.status = 'rejected';
      card.approvalDate = new Date();
      card.approvedBy = req.user.id;
      // Store rejection details
      card.rejectionReason = rejectionReason || 'No reason provided';
      card.rejectionDate = new Date();
      card.rejectedBy = req.user.id;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    await card.save();

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all cards for admin review
// @route   GET /api/cards/admin/pending
// @access  Private (Admin only)
exports.getPendingCards = async (req, res, next) => {
  try {
    // Expire any pending applications older than 7 days first so they drop out
    // of the active pending queue (they become Rejected on the user's side).
    await expireOverdueCards();

    const cards = await Card.find({
      approvalStatus: 'pending'
    }).populate('user', 'firstName lastName email profilePhoto').populate('account', 'accountNumber accountType');

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
