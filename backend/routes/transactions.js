const express = require('express');
const { getTransactions, deposit, withdraw, transfer } = require('../controllers/transactions');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getTransactions);
router.route('/deposit').post(protect, deposit);
router.route('/withdraw').post(protect, withdraw);
router.route('/transfer').post(protect, transfer);

module.exports = router;
