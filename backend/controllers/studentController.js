/**
 * studentController.js
 * ---------------------
 * All business logic for the /api/students resource.
 * Kept thin - validation lives in middleware/validator.js, query
 * building lives in utils/apiFeatures.js, response shaping lives in
 * utils/response.js. This file just orchestrates them.
 */

const Student = require('../models/Student');
const ApiFeatures = require('../utils/apiFeatures');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * POST /api/students
 * Create a new student. Duplicate email is pre-checked for a friendly
 * 409 (the unique index on `email` is the authoritative backstop).
 */
async function createStudent(req, res) {
  const email = req.body.email.trim().toLowerCase();

  const existing = await Student.findOne({ email });
  if (existing) {
    logger.warn('Duplicate email on create', { requestId: req.requestId, email });
    return errorResponse(res, `A student with email '${email}' already exists.`, 409);
  }

  const student = await Student.create({ ...req.body, email });

  logger.info('Student created', { requestId: req.requestId, studentId: student._id });
  return successResponse(res, 'Student created successfully.', student, 201);
}

/**
 * GET /api/students
 * List students with search / filter / sort / pagination.
 * Query params: search, course, semester, department, gender,
 *               sortBy, sortOrder, page, limit
 */
async function getStudents(req, res) {
  const baseQuery = Student.find();

  const features = new ApiFeatures(baseQuery, req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const [items, total] = await Promise.all([
    features.query,
    Student.countDocuments(buildCountFilter(req.query)),
  ]);

  const { page, limit } = features.pagination;
  const totalPages = Math.ceil(total / limit) || 1;

  logger.info('Students listed', { requestId: req.requestId, count: items.length, page, limit });

  return successResponse(res, 'Students retrieved successfully.', {
    items,
    count: items.length,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
  });
}

/** Rebuilds the same filter as ApiFeatures purely for an accurate countDocuments(). */
function buildCountFilter(queryParams) {
  const filter = {};
  if (queryParams.search) {
    filter.name = { $regex: queryParams.search.trim(), $options: 'i' };
  }
  ['course', 'semester', 'department', 'gender'].forEach((field) => {
    if (queryParams[field]) filter[field] = queryParams[field];
  });
  return filter;
}

/**
 * GET /api/students/:studentId
 */
async function getStudentById(req, res) {
  const student = await Student.findById(req.params.studentId);

  if (!student) {
    logger.warn('Student not found', { requestId: req.requestId, studentId: req.params.studentId });
    return errorResponse(res, `Student with id '${req.params.studentId}' not found.`, 404);
  }

  return successResponse(res, 'Student retrieved successfully.', student);
}

/**
 * PUT /api/students/:studentId
 * Partial update. If email is being changed, ensures it isn't already
 * taken by a *different* student.
 */
async function updateStudent(req, res) {
  const { studentId } = req.params;

  if (req.body.email) {
    const newEmail = req.body.email.trim().toLowerCase();
    const existing = await Student.findOne({ email: newEmail, _id: { $ne: studentId } });
    if (existing) {
      logger.warn('Duplicate email on update', { requestId: req.requestId, email: newEmail });
      return errorResponse(res, `Email '${newEmail}' is already in use by another student.`, 409);
    }
    req.body.email = newEmail;
  }

  const student = await Student.findByIdAndUpdate(
    studentId,
    { $set: req.body },
    { new: true, runValidators: true, context: 'query' }
  );

  if (!student) {
    logger.warn('Student not found for update', { requestId: req.requestId, studentId });
    return errorResponse(res, `Student with id '${studentId}' not found.`, 404);
  }

  logger.info('Student updated', { requestId: req.requestId, studentId });
  return successResponse(res, 'Student updated successfully.', student);
}

/**
 * DELETE /api/students/:studentId
 */
async function deleteStudent(req, res) {
  const { studentId } = req.params;

  const student = await Student.findByIdAndDelete(studentId);

  if (!student) {
    logger.warn('Student not found for delete', { requestId: req.requestId, studentId });
    return errorResponse(res, `Student with id '${studentId}' not found.`, 404);
  }

  logger.info('Student deleted', { requestId: req.requestId, studentId });
  return successResponse(res, 'Student deleted successfully.', { studentId });
}

/**
 * POST /api/students/:studentId/profile-image
 * Uploads a profile image (multipart/form-data, field name "profileImage")
 * and stores its accessible URL on the student record.
 */
async function uploadProfileImage(req, res) {
  const { studentId } = req.params;

  if (!req.file) {
    return errorResponse(res, "No file uploaded. Use form field name 'profileImage'.", 400);
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  const student = await Student.findByIdAndUpdate(
    studentId,
    { $set: { profileImage: imageUrl } },
    { new: true, runValidators: true }
  );

  if (!student) {
    return errorResponse(res, `Student with id '${studentId}' not found.`, 404);
  }

  logger.info('Profile image uploaded', { requestId: req.requestId, studentId, imageUrl });
  return successResponse(res, 'Profile image uploaded successfully.', student);
}

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadProfileImage,
};
