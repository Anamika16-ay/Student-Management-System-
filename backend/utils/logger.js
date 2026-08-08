/**
 * logger.js
 * ---------
 * Structured JSON logger built on Winston. Every log line is a single
 * JSON object so it plays nicely with log aggregators (CloudWatch,
 * Datadog, ELK, etc.) in production.
 */

const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'student-management-api' },
  transports: [new winston.transports.Console()],
});

module.exports = logger;
