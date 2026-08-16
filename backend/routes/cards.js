const express = require('express');
const {
  getCards,
  orderCard,
  createCard,
  approveCard,
  getPendingCards,
  getCategories,
  applyForCard,
} = require('../controllers/cards');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getCards).post(protect, createCard);
router.route('/categories').get(protect, getCategories);
// Card applications do NOT require an active account - the issuance fee is paid
// to the bank externally (via support), and the account becomes able to make
// transactions once the card is paid for.
router.route('/apply').post(protect, applyForCard);
router.route('/order-card').post(protect, orderCard);
router.route('/:id/approve').put(protect, authorize('admin'), approveCard);
router.route('/admin/pending').get(protect, authorize('admin'), getPendingCards);

module.exports = router;
