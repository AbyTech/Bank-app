const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getSecuritySettings,
  setTransactionPin,
  changeTransactionPin,
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getProfile)
  .put(protect, uploadProfilePhoto, updateProfile);

// Security settings (transaction PIN state, account status)
router.get('/security', protect, getSecuritySettings);

// Transaction PIN management
router.post('/transaction-pin', protect, setTransactionPin);
router.put('/transaction-pin', protect, changeTransactionPin);

module.exports = router;

