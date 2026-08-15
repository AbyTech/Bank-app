const express = require('express');
const {
  sendMessage,
  getConversation,
  handleWebhook,
  getStatus,
} = require('../controllers/smartsupp');
const { optionalAuth } = require('../middleware/optionalAuth');

const router = express.Router();

// Chat endpoints (guest-friendly, optional auth)
router.get('/status', getStatus);
router.post('/message', optionalAuth, sendMessage);
router.get('/conversation', optionalAuth, getConversation);

// Smartsupp webhook (HMAC-verified)
router.post('/webhook', handleWebhook);

module.exports = router;
