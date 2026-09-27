const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getUserPosts
} = require('../controllers/userController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/search', optionalProtect, searchUsers);
router.get('/:id', optionalProtect, getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/posts', optionalProtect, getUserPosts);

module.exports = router;
