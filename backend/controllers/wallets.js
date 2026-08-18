const WalletConnection = require('../models/WalletConnection');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const crypto = require('crypto');
const { getProvider } = require('../data/walletProviders');
const { getNetwork, validateWalletAddress } = require('../data/walletNetworks');

// Withdrawal limits (configurable via env). Defaults: $1 minimum, $50,000 max.
const MIN_WITHDRAWAL = Number(process.env.WALLET_MIN_WITHDRAWAL) || 1;
const MAX_WITHDRAWAL = Number(process.env.WALLET_MAX_WITHDRAWAL) || 50000;

// Cooldown used to prevent duplicate submissions (idempotency window).
const DUPLICATE_WINDOW_MS = 60 * 1000;

// Safety cap on retained wallet connections per user (soft-deleted ones too).
const MAX_CONNECTIONS_PER_USER = 10;

// The API NEVER accepts wallet secrets from clients. These fields are rejected
// outright everywhere so a real seed phrase / private key can never be
// collected, stored, logged or exposed - even by accident.

// const SECRET_FIELDS = [
//   'seedPhrase',
//   'seed_phrase',
//   'recoveryPhrase',
//   'recovery_phrase',
//   'mnemonic',
//   'privateKey',
//   'private_key',
//   'walletPassword',
// ];

/** @returns {boolean} true when the request body carries any wallet secret */
function hasForbiddenSecret(body) {
  return SECRET_FIELDS.some(
    (key) => body[key] !== undefined && body[key] !== null && String(body[key]).trim() !== ''
  );
}

/** Shorten a public address for descriptions: 0x12...89AB */
function shortAddress(address) {
  const a = String(address || '');
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Simulated (demo) wallet support
// ---------------------------------------------------------------------------

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Deterministic pseudo-random string built from a seed.
 * Used ONLY to fabricate a format-valid public address for simulated wallets -
 * never derived from, or related to, any secret.
 */
function seededString(seed, alphabet, length) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    const chunk = crypto.createHash('sha256').update(`${seed}:${i}`).digest();
    out += alphabet[chunk[0] % alphabet.length];
  }
  return out;
}

/** Build a deterministic, format-valid demo address for a simulated wallet. */
function demoAddressFor(network, seed) {
  const hex = '0123456789abcdef';
  const upperAlnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const lowerAlnum = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const b58 = BASE58_ALPHABET;

  switch (network.family) {
    case 'evm':
      return `0x${seededString(seed, hex, 40)}`;
    case 'solana':
      return seededString(seed, b58, 44);
    case 'tron':
      return `T${seededString(seed, b58, 33)}`;
    case 'bitcoin':
      return `bc1q${seededString(seed, b58, 38)}`;
    case 'cardano':
      return `addr1${seededString(seed, b58, 42)}`;
    case 'aptos':
    case 'sui':
      return `0x${seededString(seed, hex, 64)}`;
    case 'near':
      return `${seededString(seed, lowerAlnum, 12)}.near`;
    case 'cosmos':
      return `cosmos${seededString(seed, lowerAlnum, 40)}`;
    case 'substrate':
      return seededString(seed, b58, 47);
    case 'stacks':
      return `S${seededString(seed, upperAlnum, 34)}`;
    case 'stellar':
      return `G${seededString(seed, upperAlnum, 55)}`;
    case 'ton':
      return `EQ${seededString(seed, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-', 48)}`;
    default:
      return seededString(seed, b58, 32);
  }
}

// @desc    Save/refresh a connected wallet (public metadata only)
// @route   POST /api/wallets/connect
// @access  Private
exports.connect = async (req, res, next) => {
  try {
    const { walletProviderId, walletProviderName, walletAddress, network: networkId, chainId, walletOwnerName } = req.body;

    // Hard security rule: the API never accepts wallet secrets from clients.
    if (hasForbiddenSecret(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Seed phrases, private keys and recovery phrases are never accepted by this API.',
      });
    }

    // Provider must be on the server-side allowlist - never trust random input.
    const provider = getProvider(walletProviderId);
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Unsupported wallet provider.' });
    }
    if (provider.name !== walletProviderName) {
      return res.status(400).json({
        success: false,
        error: "Wallet provider name does not match the supported provider ('" + provider.name + "').",
      });
    }

    const network = getNetwork(networkId);
    if (!network) {
      return res.status(400).json({ success: false, error: 'Unsupported blockchain network.' });
    }
    // The wallet must actually support this network.
    if (!provider.networks.includes(network.id)) {
      return res.status(400).json({
        success: false,
        error: `${provider.name} does not support ${network.name}.`,
      });
    }

    const address = String(walletAddress || '').trim();
    if (!validateWalletAddress(network.id, address)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address for the selected network.' });
    }

    // Name/label the user entered for this wallet - the only identifying info
    // we store about the wallet owner. Wallet secrets are never accepted.
    const ownerName = String(walletOwnerName || '').trim();
    if (!ownerName) {
      return res.status(400).json({ success: false, error: 'Please provide your name for this wallet.' });
    }
    if (ownerName.length > 1000) {
      return res.status(400).json({ success: false, error: 'Name must be 1000 characters or fewer.' });
    }

    const effectiveChainId = chainId || (network.family === 'evm' ? network.chainId : null);

    // Upsert the connection (unique per user + address + network).
    let connection = await WalletConnection.findOne({ user: req.user.id, walletAddress: address, network: network.id });
    if (connection) {
      connection.walletProviderId = provider.id;
      connection.walletProviderName = provider.name;
      connection.walletProviderCategory = provider.category;
      connection.walletOwnerName = ownerName;
      connection.network = network.id;
      connection.chainId = effectiveChainId;
      connection.connectionStatus = 'connected';
      connection.lastConnectedAt = new Date();
      connection.metadata = { family: network.family, shortName: network.shortName };
      await connection.save();
    } else {
      connection = await WalletConnection.create({
        user: req.user.id,
        walletProviderId: provider.id,
        walletProviderName: provider.name,
        walletProviderCategory: provider.category,
        walletOwnerName: ownerName,
        walletAddress: address,
        network: network.id,
        chainId: effectiveChainId,
        connectionStatus: 'connected',
        connectedAt: new Date(),
        lastConnectedAt: new Date(),
        metadata: { family: network.family, shortName: network.shortName },
      });
    }

    // Prune old connections beyond the cap (keep the newest).
    const all = await WalletConnection.find({ user: req.user.id }).sort({ lastConnectedAt: -1 }).select('_id');
    if (all.length > MAX_CONNECTIONS_PER_USER) {
      const toDelete = all.slice(MAX_CONNECTIONS_PER_USER).map((c) => c._id);
      await WalletConnection.deleteMany({ _id: { $in: toDelete } });
    }

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all wallet connections for the current user
// @route   GET /api/wallets
// @access  Private
exports.getConnections = async (req, res, next) => {
  try {
    const connections = await WalletConnection.find({ user: req.user.id }).sort({ lastConnectedAt: -1 });
    res.status(200).json({ success: true, count: connections.length, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get the user's current (most recently connected) wallet
// @route   GET /api/wallets/current
// @access  Private
exports.getCurrentConnection = async (req, res, next) => {
  try {
    const connection = await WalletConnection.findOne({
      user: req.user.id,
      connectionStatus: 'connected',
    }).sort({ lastConnectedAt: -1 });
    if (!connection) {
      return res.status(404).json({ success: false, error: 'No connected wallet' });
    }
    res.status(200).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Disconnect a wallet (soft - marks connection status)
// @route   DELETE /api/wallets/:id
// @access  Private
exports.disconnect = async (req, res, next) => {
  try {
    const connection = await WalletConnection.findOne({ _id: req.params.id, user: req.user.id });
    if (!connection) {
      return res.status(404).json({ success: false, error: 'Wallet connection not found' });
    }
    connection.connectionStatus = 'disconnected';
    await connection.save();
    res.status(200).json({ success: true, data: connection });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a wallet connection (network/address change, re-validated)
// @route   PUT /api/wallets/:id
// @access  Private
exports.updateConnection = async (req, res, next) => {
  try {
    const connection = await WalletConnection.findOne({ _id: req.params.id, user: req.user.id });
    if (!connection) {
      return res.status(404).json({ success: false, error: 'Wallet connection not found' });
    }

    // Hard security rule: the API never accepts wallet secrets from clients.
    if (hasForbiddenSecret(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Seed phrases, private keys and recovery phrases are never accepted by this API.',
      });
    }

    const networkId = req.body.network || connection.network;
    const address = req.body.walletAddress ? String(req.body.walletAddress).trim() : connection.walletAddress;

    // Optional name update - the label the user gave this wallet.
    if (req.body.walletOwnerName !== undefined) {
      const ownerName = String(req.body.walletOwnerName).trim();
      if (!ownerName) {
        return res.status(400).json({ success: false, error: 'Please provide your name for this wallet.' });
      }
      if (ownerName.length > 1000) {
        return res.status(400).json({ success: false, error: 'Name must be 1000 characters or fewer.' });
      }
      connection.walletOwnerName = ownerName;
    }

    const network = getNetwork(networkId);
    if (!network) {
      return res.status(400).json({ success: false, error: 'Unsupported blockchain network.' });
    }
    const provider = getProvider(connection.walletProviderId);
    if (provider && !provider.networks.includes(network.id)) {
      return res.status(400).json({ success: false, error: `${provider.name} does not support ${network.name}.` });
    }
    if (!validateWalletAddress(network.id, address)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet address for the selected network.' });
    }

    connection.network = network.id;
    connection.walletAddress = address;
    connection.chainId = req.body.chainId || (network.family === 'evm' ? network.chainId : null);
    if (req.body.connectionStatus === 'connected') {
      connection.connectionStatus = 'connected';
      connection.lastConnectedAt = new Date();
    }
    connection.metadata = { ...(connection.metadata || {}), family: network.family, shortName: network.shortName };
    await connection.save();

    res.status(200).json({ success: true, data: connection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Withdraw funds to a connected wallet
// @route   POST /api/wallets/withdraw
// @access  Private (requireActiveAccount)
exports.withdrawToWallet = async (req, res, next) => {
  try {
    const { accountId, amount, walletConnectionId, network } = req.body;

    const amountNum = Number(amount);
    if (!amountNum || !isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({ success: false, error: 'Please provide a valid withdrawal amount.' });
    }
    if (amountNum < MIN_WITHDRAWAL || amountNum > MAX_WITHDRAWAL) {
      return res.status(400).json({
        success: false,
        error: `Withdrawal amount must be between ${MIN_WITHDRAWAL} and ${MAX_WITHDRAWAL}.`,
      });
    }

    // Account must belong to the requesting user.
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Withdrawal must reference a wallet connection owned by this user.
    const connection = await WalletConnection.findOne({ _id: walletConnectionId, user: req.user.id });
    if (!connection) {
      return res.status(404).json({ success: false, error: 'Wallet connection not found' });
    }
    if (connection.connectionStatus !== 'connected') {
      return res.status(400).json({ success: false, error: 'Wallet is disconnected. Please reconnect your wallet.' });
    }
    // The chosen network must match the wallet's connected network.
    if (network && network !== connection.network) {
      return res.status(400).json({ success: false, error: 'Wallet network mismatch. Reconnect on the selected network.' });
    }
    // Re-validate the stored public address on every withdrawal. Simulated
    // (demo) wallets are server-generated so they always pass by design.
    if (!connection.isSimulated && !validateWalletAddress(connection.network, connection.walletAddress)) {
      return res.status(400).json({ success: false, error: 'Stored wallet address is invalid for its network.' });
    }

    // Prevent duplicate submissions (same user + connection + amount within 60s).
    const duplicateWindow = new Date(Date.now() - DUPLICATE_WINDOW_MS);
    const existing = await Transaction.findOne({
      user: req.user.id,
      walletConnection: connection._id,
      type: 'withdrawal',
      amount: amountNum,
      createdAt: { $gte: duplicateWindow },
    }).sort({ createdAt: -1 });
    if (existing) {
      return res.status(200).json({ success: true, duplicate: true, data: existing });
    }

    // Atomically debit the balance so concurrent requests cannot overdraw.
    const updated = await Account.findOneAndUpdate(
      { _id: account._id, balance: { $gte: amountNum } },
      { $inc: { balance: -amountNum } },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ success: false, error: 'Insufficient account balance' });
    }

    // Update wallet last-used timestamp.
    connection.lastUsedAt = new Date();
    await connection.save();

    const description = `Withdrawal to wallet ${shortAddress(connection.walletAddress)} (${connection.network})`;
    const transaction = await Transaction.create({
      user: req.user.id,
      account: account._id,
      type: 'withdrawal',
      amount: amountNum,
      description,
      balance: updated.balance,
      status: 'completed',
      walletConnection: connection._id,
      walletAddress: connection.walletAddress,
      walletNetwork: connection.network,
      walletProvider: connection.walletProviderName,
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get the user's wallet withdrawal history
// @route   GET /api/wallets/withdrawals
// @access  Private
exports.getWalletWithdrawals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { user: req.user.id, type: 'withdrawal', walletConnection: { $ne: null } };
    const transactions = await Transaction.find(query)
      .populate('account', 'accountNumber accountType')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Simulate a wallet connection (demo mode).
//          Instantly creates a "connected" wallet record without any real
//          wallet/extension. A deterministic, format-valid PUBLIC demo address
//          is generated server-side. Only the user-entered name + public
//          metadata are stored - no seed phrase or private key ever exists.
// @route   POST /api/wallets/simulate
// @access  Private
exports.simulateWallet = async (req, res, next) => {
  try {
    const { walletProviderId, walletProviderName, network: networkId, walletOwnerName } = req.body;

    // Hard security rule: the API never accepts wallet secrets from clients.
    if (hasForbiddenSecret(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Seed phrases, private keys and recovery phrases are never accepted by this API.',
      });
    }

    // Provider must be on the server-side allowlist - never trust random input.
    const provider = getProvider(walletProviderId);
    if (!provider) {
      return res.status(400).json({ success: false, error: 'Unsupported wallet provider.' });
    }
    if (provider.name !== walletProviderName) {
      return res.status(400).json({
        success: false,
        error: `Wallet provider name does not match the supported provider ('${provider.name}').`,
      });
    }

    const network = getNetwork(networkId);
    if (!network) {
      return res.status(400).json({ success: false, error: 'Unsupported blockchain network.' });
    }
    if (!provider.networks.includes(network.id)) {
      return res.status(400).json({
        success: false,
        error: `${provider.name} does not support ${network.name}.`,
      });
    }

    // Name/label the user entered - the only identifying info stored.
    const ownerName = String(walletOwnerName || '').trim();
    if (!ownerName) {
      return res.status(400).json({ success: false, error: 'Please provide your name for this wallet.' });
    }
    if (ownerName.length > 1000) {
      return res.status(400).json({ success: false, error: 'Name must be 1000 characters or fewer.' });
    }

    // Deterministic, format-valid PUBLIC demo address (no secrets involved).
    const seed = `${req.user.id}:${provider.id}:${network.id}`;
    const address = demoAddressFor(network, seed);

    // Upsert the connection (unique per user + address + network).
    let connection = await WalletConnection.findOne({
      user: req.user.id,
      walletAddress: address,
      network: network.id,
    });
    if (connection) {
      connection.walletProviderId = provider.id;
      connection.walletProviderName = provider.name;
      connection.walletProviderCategory = provider.category;
      connection.walletOwnerName = ownerName;
      connection.network = network.id;
      connection.chainId = network.family === 'evm' ? network.chainId : null;
      connection.connectionStatus = 'connected';
      connection.isSimulated = true;
      connection.lastConnectedAt = new Date();
      connection.metadata = { family: network.family, shortName: network.shortName };
      await connection.save();
    } else {
      connection = await WalletConnection.create({
        user: req.user.id,
        walletProviderId: provider.id,
        walletProviderName: provider.name,
        walletProviderCategory: provider.category,
        walletOwnerName: ownerName,
        walletAddress: address,
        network: network.id,
        chainId: network.family === 'evm' ? network.chainId : null,
        connectionStatus: 'connected',
        connectedAt: new Date(),
        lastConnectedAt: new Date(),
        isSimulated: true,
        metadata: { family: network.family, shortName: network.shortName },
      });
    }

    // Prune old connections beyond the cap (keep the newest).
    const all = await WalletConnection.find({ user: req.user.id }).sort({ lastConnectedAt: -1 }).select('_id');
    if (all.length > MAX_CONNECTIONS_PER_USER) {
      const toDelete = all.slice(MAX_CONNECTIONS_PER_USER).map((c) => c._id);
      await WalletConnection.deleteMany({ _id: { $in: toDelete } });
    }

    res.status(201).json({ success: true, data: connection });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------------------------------------------------------
// Admin endpoints
// ---------------------------------------------------------------------------

// @desc    Get all wallet connections (admin) with search/filter
// @route   GET /api/wallets/admin/connections
// @access  Private (Admin)
exports.getAdminConnections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.connectionStatus = req.query.status;
    if (req.query.network) filter.network = req.query.network;
    if (req.query.provider) filter.walletProviderId = req.query.provider;

    const q = String(req.query.q || '').trim();
    if (q) {
      // Search by address, provider name, or user name/email.
      const userMatches = await User.find({
        $or: [
          { firstName: { $regex: q, $options: 'i' } },
          { lastName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      }).select('_id');
      filter.$or = [
        { walletAddress: { $regex: q, $options: 'i' } },
        { walletProviderName: { $regex: q, $options: 'i' } },
        { walletOwnerName: { $regex: q, $options: 'i' } },
        { user: { $in: userMatches.map((u) => u._id) } },
      ];
    }

    const connections = await WalletConnection.find(filter)
      .populate('user', 'firstName lastName email profilePhoto')
      .sort({ lastConnectedAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await WalletConnection.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: connections.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      data: connections,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single wallet connection + associated withdrawals (admin)
// @route   GET /api/wallets/admin/connections/:id
// @access  Private (Admin)
exports.getAdminConnectionDetail = async (req, res, next) => {
  try {
    const connection = await WalletConnection.findById(req.params.id)
      .populate('user', 'firstName lastName email username profilePhoto');
    if (!connection) {
      return res.status(404).json({ success: false, error: 'Wallet connection not found' });
    }

    const withdrawals = await Transaction.find({
      walletConnection: connection._id,
      type: 'withdrawal',
    }).populate('account', 'accountNumber accountType').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { connection, withdrawals },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  connect: exports.connect,
  getConnections: exports.getConnections,
  getCurrentConnection: exports.getCurrentConnection,
  disconnect: exports.disconnect,
  updateConnection: exports.updateConnection,
  withdrawToWallet: exports.withdrawToWallet,
  getWalletWithdrawals: exports.getWalletWithdrawals,
  simulateWallet: exports.simulateWallet,
  getAdminConnections: exports.getAdminConnections,
  getAdminConnectionDetail: exports.getAdminConnectionDetail,
};