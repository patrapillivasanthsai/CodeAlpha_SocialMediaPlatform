const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seed] Database already contains data. Skipping seed.');
      return;
    }

    console.log('[Seed] Seeding sample data...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Sample Users
    const alex = await User.create({
      username: 'alex_dev',
      email: 'alex@example.com',
      password: hashedPassword,
      bio: 'Full Stack Developer & Open Source enthusiast 🚀 Building cool products with Node.js & Web technologies.',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    });

    const elena = await User.create({
      username: 'elena_design',
      email: 'elena@example.com',
      password: hashedPassword,
      bio: 'UI/UX Designer interested in editorial layouts, warm ivory palettes, and human-centered design ✨',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
    });

    const marcus = await User.create({
      username: 'marcus_tech',
      email: 'marcus@example.com',
      password: hashedPassword,
      bio: 'Software engineer, coffee lover ☕, exploring AI & system architecture.',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    });

    // Establish follow connections
    alex.following.push(elena._id, marcus._id);
    alex.followers.push(elena._id);
    await alex.save();

    elena.followers.push(alex._id);
    elena.following.push(alex._id);
    await elena.save();

    marcus.followers.push(alex._id);
    await marcus.save();

    // Create Sample Posts
    const post1 = await Post.create({
      author: alex._id,
      content: 'Super excited to present Connectly — a modern full-stack social media platform built for CodeAlpha! Warm editorial aesthetics meets powerful REST APIs. What do you think of the deep forest green and ivory theme?',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
      likes: [elena._id, marcus._id]
    });

    const post2 = await Post.create({
      author: elena._id,
      content: 'Minimalism isn\'t about having less, it\'s about making space for what matters most. Today I worked on some clean UI card layouts for our upcoming project launch 🌿',
      image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
      likes: [alex._id]
    });

    const post3 = await Post.create({
      author: marcus._id,
      content: 'Just deployed a new Microservice architecture backend. Clean code, comprehensive unit tests, and seamless API endpoints make developer life so much better!',
      likes: [alex._id]
    });

    // Create Sample Comments
    await Comment.create({
      post: post1._id,
      author: elena._id,
      content: 'The ivory background with coral accents looks incredibly sleek! Outstanding work Alex 🔥'
    });

    await Comment.create({
      post: post1._id,
      author: marcus._id,
      content: 'Great job on the REST API structure and Mongoose schemas!'
    });

    await Comment.create({
      post: post2._id,
      author: alex._id,
      content: 'Love this layout perspective! Super clean typography.'
    });

    // Create Sample Notifications for Alex
    await Notification.create({
      recipient: alex._id,
      sender: elena._id,
      type: 'follow'
    });

    await Notification.create({
      recipient: alex._id,
      sender: elena._id,
      type: 'like',
      post: post1._id
    });

    await Notification.create({
      recipient: alex._id,
      sender: elena._id,
      type: 'comment',
      post: post1._id
    });

    console.log('[Seed] Database successfully populated with sample users, posts, and comments!');
    console.log('[Seed] Default Login Credentials: alex@example.com / password123 or elena@example.com / password123');
  } catch (error) {
    console.error('[Seed] Error seeding data:', error.message);
  }
};

module.exports = seedData;
