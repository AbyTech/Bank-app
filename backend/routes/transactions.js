const express = require('express');
const { getTransactions, deposit, withdraw, transfer } = require('../controllers/transactions');
const { protect, requireActiveAccount, requireTransactionPin } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getTransactions);
router.route('/deposit').post(protect, requireActiveAccount, requireTransactionPin, deposit);
router.route('/withdraw').post(protect, requireActiveAccount, requireTransactionPin, withdraw);
router.route('/transfer').post(protect, requireActiveAccount, requireTransactionPin, transfer);

module.exports = router;
