const express = require('express');
const router = express.Router({ mergeParams: true });
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// Post-nested routes (/api/posts/:id/comments)
router.get('/', getComments);
router.post('/', protect, addComment);

// Direct comment route (/api/comments/:id)
router.delete('/:id', protect, deleteComment);

module.exports = router;
