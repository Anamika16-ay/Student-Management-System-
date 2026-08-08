import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStudentById, deleteStudent } from '../api/studentApi';

/**
 * StudentDetailsPage.jsx
 * ------------------------
 * Read-only detail view of a single student, with Edit/Delete actions.
 */
export default function StudentDetailsPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentById(studentId)
      .then((res) => setStudent(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Student not found.'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    await deleteStudent(studentId);
    navigate('/');
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!student) return null;

  return (
    <div className="details-page">
      <Link to="/" className="back-link">← Back to Students</Link>

      <div className="details-card">
        <div className="details-avatar">
          {student.profileImage ? (
            <img src={student.profileImage} alt={student.name} />
          ) : (
            <span>{student.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </div>

        <h1>{student.name}</h1>
        <p className="muted">{student.email}</p>

        <dl className="details-grid">
          <dt>Phone</dt><dd>{student.phone}</dd>
          <dt>Course</dt><dd>{student.course}</dd>
          <dt>Semester</dt><dd>{student.semester}</dd>
          <dt>Department</dt><dd>{student.department}</dd>
          <dt>Address</dt><dd>{student.address || '—'}</dd>
          <dt>Date of Birth</dt><dd>{student.dateOfBirth || '—'}</dd>
          <dt>Gender</dt><dd>{student.gender || '—'}</dd>
          <dt>Created</dt><dd>{new Date(student.createdAt).toLocaleString()}</dd>
          <dt>Last Updated</dt><dd>{new Date(student.updatedAt).toLocaleString()}</dd>
        </dl>

        <div className="form-actions">
          <Link to={`/students/${studentId}/edit`} className="btn btn-primary">Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}
