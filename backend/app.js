/**
 * app.js
 * ------
 * Express application setup - separated from server.js so it can be
 * imported directly by tests (supertest) without actually binding to
 * a port.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const requestId = require('./middleware/requestId');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const studentRoutes = require('./routes/studentRoutes');
const { successResponse } = require('./utils/response');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ALLOW_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Rate limiting (basic abuse protection) ---
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// --- Request tracing / logging ---
app.use(requestId);
app.use(requestLogger);

// --- Static file serving for uploaded profile images ---
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// --- Health check (for uptime monitors / load balancers) ---
app.get('/health', (req, res) => {
  return successResponse(res, 'Service is healthy.', { uptimeSeconds: process.uptime() });
});

// --- API routes ---
app.use('/api/students', studentRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
