const express = require('express');
const { getCards, orderCard, createCard } = require('../controllers/cards');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getCards).post(protect, createCard);
router.route('/order-card').post(protect, orderCard);

module.exports = router;
