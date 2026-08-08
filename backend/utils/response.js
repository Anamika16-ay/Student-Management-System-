/**
 * response.js
 * -----------
 * Standardised API response builder - every endpoint in this project
 * returns the same envelope:
 *
 *   {
 *     status: "success" | "error",
 *     message: "<human readable message>",
 *     data: <payload | null>,
 *     timestamp: "<ISO-8601 UTC>",
 *     requestId: "<per-request UUID, set by requestId middleware>"
 *   }
 */

function buildResponse(res, statusCode, status, message, data = null) {
  return res.status(statusCode).json({
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.req.requestId || 'N/A',
  });
}

function successResponse(res, message, data = null, statusCode = 200) {
  return buildResponse(res, statusCode, 'success', message, data);
}

function errorResponse(res, message, statusCode = 400, data = null) {
  return buildResponse(res, statusCode, 'error', message, data);
}

module.exports = { successResponse, errorResponse };
