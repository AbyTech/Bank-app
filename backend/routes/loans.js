const express = require('express');
const { getLoans, applyForLoan, makePayment } = require('../controllers/loans');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/').get(protect, getLoans);
router.route('/apply').post(protect, upload, applyForLoan);
router.route('/:id/payment').post(protect, makePayment);

module.exports = router;
