const express = require('express');
const { getAccounts } = require('../controllers/accounts');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getAccounts);

module.exports = router;
