const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public (Optional auth for isFollowing flag)
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(
        (follower) => follower._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profileImage: user.profileImage,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        following: user.following,
        isFollowing,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this profile' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { username, bio, profileImage } = req.body;

    if (username && username.trim() !== user.username) {
      const existingUser = await User.findOne({ username: username.trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
      user.username = username.trim();
    }

    if (bio !== undefined) user.bio = bio;
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    if (!query.trim()) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      username: { $regex: query.trim(), $options: 'i' }
    })
      .select('username profileImage bio followers following')
      .limit(20);

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      username: u.username,
      profileImage: u.profileImage,
      bio: u.bio,
      followersCount: u.followers ? u.followers.length : 0,
      followingCount: u.following ? u.following.length : 0,
      isFollowing: req.user
        ? u.followers.some((id) => id.toString() === req.user._id.toString())
        : false
    }));

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to follow not found' });
    }

    // Check if already following (correct string comparison)
    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ success: false, message: 'You are already following this user' });
    }

    // Add to target's followers and current's following
    await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });

    // Create Notification
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: 'follow'
    });

    const updatedTargetUser = await User.findById(targetUserId);

    res.json({
      success: true,
      message: `You are now following ${targetUser.username}`,
      followersCount: updatedTargetUser.followers.length,
      isFollowing: true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot unfollow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove from target's followers and current's following
    await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
    await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });

    const updatedTargetUser = await User.findById(targetUserId);

    res.json({
      success: true,
      message: `Unfollowed ${targetUser.username}`,
      followersCount: updatedTargetUser.followers.length,
      isFollowing: false
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by user ID
// @route   GET /api/users/:id/posts
// @access  Public
const getUserPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'username profileImage');

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes ? post.likes.length : 0,
      isLiked: req.user
        ? post.likes.some((id) => id.toString() === req.user._id.toString())
        : false
    }));

    res.json({
      success: true,
      posts: formattedPosts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getUserPosts
};
