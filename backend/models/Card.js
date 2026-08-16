const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  account: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
    required: true,
  },
  cardNumber: {
    type: String,
    unique: true,
    required: true,
  },
  cardType: {
    type: String,
    enum: ['debit', 'credit', 'virtual', 'physical'],
    default: 'debit',
  },
  cardName: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'expired', 'pending', 'pending_payment', 'rejected'],
    default: 'active',
  },
  purchaseStatus: {
    type: String,
    enum: ['completed', 'pending_payment', 'pending_approval', 'approved', 'declined'],
    default: 'completed',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'approved',
  },
  approvalDate: {
    type: Date,
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
  rejectionDate: {
    type: Date,
  },
  rejectedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  purchaseAmount: {
    type: Number,
    default: 0,
  },
  paymentDeadline: {
    type: Date,
  },
  type: {
    type: String,
    enum: ['virtual', 'physical'],
  },
  // Card category/tier (configurable via data/cardCategories.js). Fees are
  // always computed server-side from that config - never trusted from clients.
  category: {
    type: String,
    enum: ['standard', 'gold', 'platinum', 'black'],
    default: 'standard',
  },
  // Issuance fee charged to the user's account upon approval (server-side).
  fee: {
    type: Number,
    default: 0,
  },
  termsAccepted: {
    type: Boolean,
    default: false,
  },
  // Card PIN - hashed with bcrypt, NEVER stored or returned in plaintext.
  // Kept completely separate from the user's transaction PIN.
  cardPin: {
    type: String,
    select: false,
  },
  cardPinSet: {
    type: Boolean,
    default: false,
  },
  // Physical-card delivery information (only populated for physical cards).
  deliveryInfo: {
    fullName: { type: String, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
    zipCode: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', CardSchema);
