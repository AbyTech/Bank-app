const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserBlock,
  getUserDetails
} = require('../controllers/users');

const router = express.Router();

router.route('/').get(getUsers);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);
router.route('/:id/details').get(getUserDetails);
router.route('/:id/toggle-block').put(toggleUserBlock);

module.exports = router;