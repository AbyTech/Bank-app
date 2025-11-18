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
    enum: ['active', 'blocked', 'expired', 'pending_payment'],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', CardSchema);
