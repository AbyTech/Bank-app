const express = require('express');
const { getCards, orderCard, createCard, approveCard, getPendingCards } = require('../controllers/cards');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getCards).post(protect, createCard);
router.route('/order-card').post(protect, orderCard);
router.route('/:id/approve').put(protect, authorize('admin'), approveCard);
router.route('/admin/pending').get(protect, authorize('admin'), getPendingCards);

module.exports = router;
