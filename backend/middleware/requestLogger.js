/**
 * requestLogger.js
 * ----------------
 * Logs every request/response with method, path, status code, and
 * duration in milliseconds - the Express equivalent of the
 * CloudWatch structured logs in the original serverless version.
 */

const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('HTTP request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}

module.exports = requestLogger;
