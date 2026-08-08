/**
 * errorHandler.js
 * ---------------
 * Centralised Express error-handling middleware. Every controller
 * forwards unexpected errors here via next(error) (or they bubble up
 * automatically from async handlers wrapped in asyncHandler.js).
 *
 * Handles Mongoose-specific error types explicitly so clients get
 * meaningful status codes instead of a generic 500 for common cases
 * like validation failures or duplicate keys.
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error('Unhandled error', {
    requestId: req.requestId,
    error: err.message,
    stack: err.stack,
  });

  // Mongoose validation error (schema-level required/format checks)
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 'Validation failed.', 422, { errors });
  }

  // Duplicate key error (unique email index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, `A student with this ${field} already exists.`, 409);
  }

  // Invalid ObjectId format passed as :studentId
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid studentId format: '${err.value}'.`, 400);
  }

  return errorResponse(res, 'An unexpected error occurred.', err.statusCode || 500);
}

function notFoundHandler(req, res) {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = { errorHandler, notFoundHandler };
