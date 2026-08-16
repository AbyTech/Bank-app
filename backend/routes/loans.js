const express = require('express');
const { getLoans, applyForLoan, makePayment } = require('../controllers/loans');
const { protect, requireActiveAccount } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/').get(protect, getLoans);
router.route('/apply').post(protect, requireActiveAccount, upload, applyForLoan);
router.route('/:id/payment').post(protect, requireActiveAccount, makePayment);

module.exports = router;
