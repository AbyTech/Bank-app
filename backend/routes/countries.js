const express = require('express');
const router = express.Router();
const countries = require('../data/countries');

// @desc    Get all countries
// @route   GET /api/countries
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: countries });
});

module.exports = router;
