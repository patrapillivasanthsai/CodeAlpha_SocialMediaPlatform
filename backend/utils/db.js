const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  // 1. If MONGO_URI is set, attempt persistent MongoDB connection first
  if (mongoUri && mongoUri.trim() && !mongoUri.includes('your_mongodb_connection_string')) {
    try {
      const sanitizedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
      console.log(`[Database] Connecting to persistent MongoDB at: ${sanitizedUri}`);

      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000
      });

      console.log(`[Database] Successfully connected to persistent MongoDB!`);
      console.log(`[Database] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      console.warn(`[Database Warning] Could not connect to configured MONGO_URI (${error.message}).`);
      console.log('[Database] Falling back to local persistent disk database (data/db)...');
    }
  }

  // 2. Fallback: Persistent embedded disk database in data/db
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const dbPath = path.join(__dirname, '../data/db');
    fs.mkdirSync(dbPath, { recursive: true });

    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger'
      }
    });

    const fallbackUri = mongodInstance.getUri();
    const conn = await mongoose.connect(fallbackUri);
    console.log(`[Database] Connected to local persistent disk database at: ${fallbackUri}`);
    return conn;
  } catch (memErr) {
    console.error('[Database Error] Failed to initialize persistent database fallback:', memErr.message);
    process.exit(1);
  }
};

// Graceful connection shutdown handler
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('[Database] Mongoose database connection closed gracefully.');
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      console.log('[Database] Local persistent database instance stopped.');
    }
  } catch (err) {
    console.error('[Database Error] Error during database shutdown:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
