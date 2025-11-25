const express = require('express');
const { getAccounts, getRecipient } = require('../controllers/accounts');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getAccounts);
router.route('/recipient/:accountNumber').get(protect, getRecipient);

module.exports = router;
