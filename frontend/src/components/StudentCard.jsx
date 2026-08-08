import React from 'react';
import { Link } from 'react-router-dom';

/**
 * StudentCard.jsx
 * ---------------
 * Compact card representation of a student, used in the list/grid view.
 */
export default function StudentCard({ student, onDelete }) {
  return (
    <div className="student-card">
      <div className="student-card-avatar">
        {student.profileImage ? (
          <img src={student.profileImage} alt={student.name} />
        ) : (
          <span>{student.name?.charAt(0)?.toUpperCase() || '?'}</span>
        )}
      </div>
      <div className="student-card-body">
        <h3>{student.name}</h3>
        <p className="muted">{student.email}</p>
        <div className="badges">
          <span className="badge">{student.course}</span>
          <span className="badge">Sem {student.semester}</span>
          <span className="badge">{student.department}</span>
        </div>
      </div>
      <div className="student-card-actions">
        <Link to={`/students/${student.studentId}`} className="btn btn-sm">View</Link>
        <Link to={`/students/${student.studentId}/edit`} className="btn btn-sm btn-outline">Edit</Link>
        <button className="btn btn-sm btn-danger" onClick={() => onDelete(student.studentId)}>
          Delete
        </button>
      </div>
    </div>
  );
}
