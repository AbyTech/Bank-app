const express = require('express');
const { getTransactions, deposit, withdraw, transfer } = require('../controllers/transactions');
const { protect, requireActiveAccount } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getTransactions);
router.route('/deposit').post(protect, requireActiveAccount, deposit);
router.route('/withdraw').post(protect, requireActiveAccount, withdraw);
router.route('/transfer').post(protect, requireActiveAccount, transfer);

module.exports = router;
