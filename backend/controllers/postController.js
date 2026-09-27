const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get feed posts (Optionally filter by following or all)
// @route   GET /api/posts
// @access  Public (Optional Auth for isLiked flag and following filter)
const getPosts = async (req, res, next) => {
  try {
    const { feed } = req.query;
    let query = {};

    if (feed === 'following' && req.user) {
      const currentUser = await User.findById(req.user._id);
      query = { author: { $in: [...currentUser.following, req.user._id] } };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username profileImage bio');

    // Get comment counts for each post efficiently
    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);

    const commentCountMap = {};
    commentCounts.forEach((item) => {
      commentCountMap[item._id.toString()] = item.count;
    });

    const formattedPosts = posts.map((post) => {
      const postObj = post.toObject();
      return {
        ...postObj,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: commentCountMap[post._id.toString()] || 0,
        isLiked: req.user
          ? post.likes.some((id) => id.toString() === req.user._id.toString())
          : false
      };
    });

    res.json({
      success: true,
      count: formattedPosts.length,
      posts: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { content, image } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: image || ''
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username profileImage');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...populatedPost.toObject(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username profileImage bio');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const commentsCount = await Comment.countDocuments({ post: post._id });

    res.json({
      success: true,
      post: {
        ...post.toObject(),
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount,
        isLiked: req.user
          ? post.likes.some((id) => id.toString() === req.user._id.toString())
          : false
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    const { content, image } = req.body;
    if (content !== undefined) post.content = content.trim();
    if (image !== undefined) post.image = image;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate('author', 'username profileImage');
    const commentsCount = await Comment.countDocuments({ post: post._id });

    res.json({
      success: true,
      message: 'Post updated successfully',
      post: {
        ...updatedPost.toObject(),
        likesCount: updatedPost.likes.length,
        commentsCount,
        isLiked: updatedPost.likes.some((id) => id.toString() === req.user._id.toString())
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    await Notification.deleteMany({ post: req.params.id });

    res.json({
      success: true,
      message: 'Post deleted successfully',
      postId: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({ success: false, message: 'You have already liked this post' });
    }

    post.likes.push(req.user._id);
    await post.save();

    // Create Notification if not liking own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: post._id
      });
    }

    res.json({
      success: true,
      message: 'Post liked',
      likesCount: post.likes.length,
      isLiked: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    await post.save();

    res.json({
      success: true,
      message: 'Post unliked',
      likesCount: post.likes.length,
      isLiked: false
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost
};
