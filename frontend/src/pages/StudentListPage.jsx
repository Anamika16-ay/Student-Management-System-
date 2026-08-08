import React, { useEffect, useState, useCallback } from 'react';
import { getStudents, deleteStudent } from '../api/studentApi';
import StudentCard from '../components/StudentCard.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import Toast from '../components/Toast.jsx';

/**
 * StudentListPage.jsx
 * --------------------
 * Main landing page: fetches students with the current search/filter/
 * sort/pagination state and re-fetches whenever that state changes.
 */
export default function StudentListPage() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 9, sortBy: 'name', sortOrder: 'asc' });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudents(filters);
      setStudents(res.data.items);
      setMeta({ page: res.data.page, totalPages: res.data.totalPages, total: res.data.total });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to load students.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleDelete = async (studentId) => {
    if (!window.confirm('Delete this student? This cannot be undone.')) return;
    try {
      await deleteStudent(studentId);
      setToast({ message: 'Student deleted successfully.', type: 'success' });
      fetchStudents();
    } catch (err) {
      setToast({
        message: err.response?.data?.message || 'Failed to delete student.',
        type: 'error',
      });
    }
  };

  return (
    <div>
      <Toast {...toast} onClose={() => setToast({ message: '', type: 'success' })} />

      <h1>Students {meta.total ? `(${meta.total})` : ''}</h1>

      <SearchFilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <p className="muted">Loading students...</p>
      ) : students.length === 0 ? (
        <p className="muted">No students found. Try adjusting your filters, or add a new student.</p>
      ) : (
        <div className="student-grid">
          {students.map((student) => (
            <StudentCard key={student.studentId} student={student} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
      />
    </div>
  );
}
