const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserBlock,
  getUserDetails,
  updateUserBalance
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All user-management endpoints are admin-only and require authentication
router.route('/').get(protect, authorize('admin'), getUsers);
router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);
router.route('/:id/details').get(protect, authorize('admin'), getUserDetails);
router.route('/:id/toggle-block').put(protect, authorize('admin'), toggleUserBlock);
router.route('/:id/balance').put(protect, authorize('admin'), updateUserBalance);

module.exports = router;