const express = require('express');
const { getFundingConfig } = require('../controllers/config');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Funding methods configuration (wallet addresses from server env vars)
router.get('/funding', protect, getFundingConfig);

module.exports = router;
