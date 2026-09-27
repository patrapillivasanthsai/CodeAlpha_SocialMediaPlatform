const express = require('express');
const router = express.Router();
const {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost
} = require('../controllers/postController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getPosts);
router.post('/', protect, createPost);
router.get('/:id', optionalProtect, getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);

module.exports = router;
