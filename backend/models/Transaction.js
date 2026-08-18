const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'fee', 'admin'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  toAccount: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
  },
  // Currency-conversion metadata populated for cross-currency transfers.
  // (These were previously set by the transfer controller but not declared in
  // the schema, so Mongoose silently dropped them.)
  convertedAmount: {
    type: Number,
  },
  originalCurrency: {
    type: String,
  },
  convertedCurrency: {
    type: String,
  },
  exchangeRate: {
    type: Number,
  },
  card: {
    type: mongoose.Schema.ObjectId,
    ref: 'Card',
  },
  loan: {
    type: mongoose.Schema.ObjectId,
    ref: 'Loan',
  },
  // Wallet metadata for withdrawals made to a crypto wallet. Only PUBLIC
  // wallet information is stored here (address, network, provider). No secrets
  // are ever persisted, transmitted or logged.
  walletConnection: {
    type: mongoose.Schema.ObjectId,
    ref: 'WalletConnection',
  },
  walletAddress: {
    type: String,
    default: null,
  },
  walletNetwork: {
    type: String,
    default: null,
  },
  walletProvider: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
