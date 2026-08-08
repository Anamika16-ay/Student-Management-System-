/**
 * db.js
 * -----
 * MongoDB connection handler using Mongoose.
 * Reads the connection string from process.env.MONGODB_URI so the same
 * codebase works against local MongoDB, Docker, or MongoDB Atlas just by
 * changing the .env file.
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not set in the environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    logger.info('MongoDB connected successfully', { host: mongoose.connection.host });
  } catch (error) {
    logger.error('MongoDB connection failed', { error: error.message });
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message });
  });
}

module.exports = connectDB;
