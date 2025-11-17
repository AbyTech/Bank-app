const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserDetails
} = require('../controllers/users');

const router = express.Router();

const { protect } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
  }
  next();
};

router.use(adminOnly);

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/details')
  .get(getUserDetails);

module.exports = router;
