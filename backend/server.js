const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('./utils/db');
const seedData = require('./utils/seed');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/posts/:id/comments', require('./routes/commentRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Connectly API server is running smooth!' });
});

// HTML page routing fallbacks for frontend pages
app.get('/login', (req, res) => res.sendFile(path.join(frontendPath, 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(frontendPath, 'register.html')));
app.get('/feed', (req, res) => res.sendFile(path.join(frontendPath, 'feed.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(frontendPath, 'profile.html')));
app.get('/search', (req, res) => res.sendFile(path.join(frontendPath, 'search.html')));
app.get('/notifications', (req, res) => res.sendFile(path.join(frontendPath, 'notifications.html')));
app.get('/create-post', (req, res) => res.sendFile(path.join(frontendPath, 'create-post.html')));

// Global Error & 404 Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

// Connect to Database & start server
connectDB()
  .then(() => {
    seedData();
    server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  🚀 CONNECTLY SERVER IS RUNNING ON PORT ${PORT}`);
      console.log(`  📍 Local Web App: http://localhost:${PORT}`);
      console.log(`  🔌 REST API Base: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error(`[Server Startup Error] Database connection failed: ${err.message}`);
    process.exit(1);
  });

// Handle graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n[Server Shutdown] Received ${signal}. Closing HTTP server & Database connection...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('[Server Shutdown] Connectly process terminated cleanly.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
