/**
 * validator.js
 * ------------
 * Request-body validation middleware for create/update endpoints.
 * Mongoose schema validation (models/Student.js) is the final line of
 * defence, but validating here first lets us return a single clean
 * 422 response with all field errors at once, and whitelist which
 * fields are accepted at all (defence against NoSQL injection via
 * unexpected operators like `{"$ne": null}` in the body).
 */

const { errorResponse } = require('../utils/response');

const ALLOWED_FIELDS = [
  'name', 'email', 'phone', 'course', 'semester', 'department',
  'address', 'dateOfBirth', 'gender', 'profileImage',
];

const REQUIRED_ON_CREATE = ['name', 'email', 'phone', 'course', 'semester', 'department'];

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_GENDERS = ['male', 'female', 'other', ''];

/** Strip any key not in the whitelist - prevents operator/field injection. */
function sanitizeBody(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return {};
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) clean[key] = body[key];
  }
  return clean;
}

function validateFields(body, { requireAll }) {
  const errors = [];

  if (requireAll) {
    REQUIRED_ON_CREATE.forEach((field) => {
      const value = body[field];
      if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        errors.push(`'${field}' is required.`);
      }
    });
  }

  if (body.name !== undefined && body.name !== null) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push("'name' must be a string with at least 2 characters.");
    }
  }

  if (body.email !== undefined && body.email !== null && body.email !== '') {
    if (typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email.trim())) {
      errors.push("'email' is not a valid email address.");
    }
  }

  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string' || !PHONE_REGEX.test(body.phone.trim())) {
      errors.push("'phone' must contain 7-15 digits, optionally prefixed with '+'.");
    }
  }

  if (body.semester !== undefined && body.semester !== null && body.semester !== '') {
    const sem = Number(body.semester);
    if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
      errors.push("'semester' must be an integer between 1 and 12.");
    }
  }

  if (body.dateOfBirth) {
    if (!DATE_REGEX.test(body.dateOfBirth) || Number.isNaN(Date.parse(body.dateOfBirth))) {
      errors.push("'dateOfBirth' must be a valid date in YYYY-MM-DD format.");
    }
  }

  if (body.gender !== undefined && body.gender !== null) {
    if (!ALLOWED_GENDERS.includes(String(body.gender).toLowerCase())) {
      errors.push("'gender' must be one of: male, female, other.");
    }
  }

  return errors;
}

/** Middleware for POST /api/students - all required fields must be present. */
function validateCreateStudent(req, res, next) {
  req.body = sanitizeBody(req.body);
  const errors = validateFields(req.body, { requireAll: true });
  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed.', 422, { errors });
  }
  next();
}

/** Middleware for PUT /api/students/:studentId - partial update, all fields optional. */
function validateUpdateStudent(req, res, next) {
  req.body = sanitizeBody(req.body);
  delete req.body.studentId; // studentId is immutable

  if (Object.keys(req.body).length === 0) {
    return errorResponse(res, 'Request body must contain at least one field to update.', 400);
  }

  const errors = validateFields(req.body, { requireAll: false });
  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed.', 422, { errors });
  }
  next();
}

module.exports = { validateCreateStudent, validateUpdateStudent, sanitizeBody };
