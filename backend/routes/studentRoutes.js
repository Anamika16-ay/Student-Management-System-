/**
 * studentRoutes.js
 * ----------------
 * Defines the /api/students resource routes and wires up validation,
 * upload, and controller middleware for each one.
 */

const express = require('express');
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadProfileImage,
} = require('../controllers/studentController');

const { validateCreateStudent, validateUpdateStudent } = require('../middleware/validator');
const asyncHandler = require('../middleware/asyncHandler');
const upload = require('../middleware/upload');

// POST   /api/students                       - create
// GET    /api/students                       - list (search/filter/sort/paginate)
router.route('/')
  .post(validateCreateStudent, asyncHandler(createStudent))
  .get(asyncHandler(getStudents));

// GET    /api/students/:studentId            - get by id
// PUT    /api/students/:studentId             - update (partial)
// DELETE /api/students/:studentId             - delete
router.route('/:studentId')
  .get(asyncHandler(getStudentById))
  .put(validateUpdateStudent, asyncHandler(updateStudent))
  .delete(asyncHandler(deleteStudent));

// POST   /api/students/:studentId/profile-image - upload profile image
router.post(
  '/:studentId/profile-image',
  upload.single('profileImage'),
  asyncHandler(uploadProfileImage)
);

module.exports = router;
