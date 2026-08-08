/**
 * requestId.js
 * ------------
 * Attaches a unique requestId to every incoming request (and echoes it
 * back in the `X-Request-Id` response header). Used by response.js to
 * populate the `requestId` field of every API response, and by the
 * logger for request tracing.
 */

const { v4: uuidv4 } = require('uuid');

function requestId(req, res, next) {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}

module.exports = requestId;
