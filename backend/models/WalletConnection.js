const mongoose = require('mongoose');

/**
 * WalletConnection - a user's connected crypto wallet.
 * ---------------------------------------------------------------------------
 * Stores ONLY public wallet metadata (provider, address, network, connection
 * status, timestamps). It NEVER stores seed phrases, recovery phrases, private
 * keys or external-wallet passwords - by design there is no field for them.
 *
 * Addresses are validated server-side (data/walletNetworks.js) before being
 * written here. Each (user, walletAddress) pair is unique, and a user may have
 * a small number of past connections kept for history/gesture purposes.
 */
const WalletConnectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Source of truth for provider id/name/network support lives in
    // backend/data/walletProviders.js; the stored name/network are denormalized
    // copies for convenient display only.
    walletProviderId: {
      type: String,
      required: true,
      trim: true,
    },
    walletProviderName: {
      type: String,
      required: true,
      trim: true,
      default: 'Wallet',
    },
    walletProviderCategory: {
      type: String,
      trim: true,
      default: 'Hot Wallet',
    },
    // Public address only. Validated against the network's address format.
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: false,
    },
    network: {
      type: String,
      required: true,
      trim: true,
    },
    chainId: {
      type: String,
      default: null,
    },
    // Connection lifecycle state. 'disconnected' is the soft-listed state so
    // admins/users can still see past connections and associated withdrawals.
    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
    },
    // Name/label the user typed when connecting the wallet. This is the ONLY
    // identifying information stored about the wallet owner - wallet secrets
    // (seed phrases, private keys, recovery phrases) are never accepted,
    // stored or exposed anywhere in the system.
    walletOwnerName: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Wallet name is too long (max 500 characters).'],
    },
    // Simulated (demo) wallet connection - created instantly by the API without
    // a real wallet/extension. Only PUBLIC metadata is stored; no seed phrase
    // or private key exists anywhere in the system.
    isSimulated: {
      type: Boolean,
      default: false,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastConnectedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    // Arbitrary, non-sensitive wallet metadata the application may need
    // (e.g. chain family). Never secrets.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// A user can only have one live connection per (address + network). Slows
// down nothing at this scale and guarantees no duplicate live wallets.
WalletConnectionSchema.index({ user: 1, walletAddress: 1, network: 1 }, { unique: true });

WalletConnectionSchema.index({ connectionStatus: 1 });
WalletConnectionSchema.index({ lastUsedAt: 1 });

module.exports = mongoose.model('WalletConnection', WalletConnectionSchema);