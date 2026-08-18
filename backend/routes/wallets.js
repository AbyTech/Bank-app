const express = require('express');
const {
  connect,
  getConnections,
  getCurrentConnection,
  disconnect,
  updateConnection,
  withdrawToWallet,
  getWalletWithdrawals,
  simulateWallet,
  getAdminConnections,
  getAdminConnectionDetail,
} = require('../controllers/wallets');
const { protect, authorize, requireActiveAccount } = require('../middleware/auth');

const router = express.Router();

// User wallet endpoints
router.get('/', protect, getConnections);
router.get('/current', protect, getCurrentConnection);
router.post('/connect', protect, connect);
router.post('/simulate', protect, simulateWallet);
router.post('/withdraw', protect, requireActiveAccount, withdrawToWallet);
router.get('/withdrawals', protect, getWalletWithdrawals);
router.delete('/:id', protect, disconnect);
router.put('/:id', protect, updateConnection);

// Admin wallet endpoints
router.get('/admin/connections', protect, authorize('admin'), getAdminConnections);
router.get('/admin/connections/:id', protect, authorize('admin'), getAdminConnectionDetail);

module.exports = router;