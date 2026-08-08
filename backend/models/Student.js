/**
 * Student.js
 * ----------
 * Mongoose schema/model for a student record.
 *
 * Notes:
 *  - `email` has a unique index -> MongoDB itself rejects duplicate
 *    emails at the database layer (E11000 error), and the controller
 *    additionally pre-checks for a friendlier 409 response.
 *  - `_id` (Mongo ObjectId) is used as the studentId - no separate
 *    UUID field is needed since Mongo's ObjectId is already a globally
 *    unique, index-friendly identifier.
 *  - `timestamps: true` auto-manages createdAt / updatedAt.
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/, 'Invalid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Phone must contain 7-15 digits, optionally prefixed with +'],
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 12'],
      max: [12, 'Semester must be between 1 and 12'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    dateOfBirth: {
      type: String, // Stored as 'YYYY-MM-DD' for simplicity/consistency with the API contract
      default: '',
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other', ''],
        message: 'Gender must be one of: male, female, other',
      },
      default: '',
    },
    profileImage: {
      type: String, // relative/absolute URL to the uploaded image
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.studentId = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes to support search/filter/sort access patterns efficiently.
studentSchema.index({ name: 'text' });
studentSchema.index({ course: 1, createdAt: -1 });
studentSchema.index({ semester: 1, createdAt: -1 });
studentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Student', studentSchema);
