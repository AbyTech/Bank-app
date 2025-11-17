const express = require('express');
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getProfile).put(protect, uploadProfilePhoto, updateProfile);

module.exports = router;
