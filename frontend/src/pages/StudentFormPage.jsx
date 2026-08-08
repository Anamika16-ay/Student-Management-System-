import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createStudent, getStudentById, updateStudent, uploadProfileImage } from '../api/studentApi';

const EMPTY_FORM = {
  name: '', email: '', phone: '', course: '', semester: '', department: '',
  address: '', dateOfBirth: '', gender: '',
};

/**
 * StudentFormPage.jsx
 * --------------------
 * Shared Create/Edit form. In "edit" mode it pre-loads the existing
 * record; in "create" mode it starts blank. Field-level errors
 * returned by the backend's 422 response are shown inline.
 */
export default function StudentFormPage({ mode }) {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && studentId) {
      getStudentById(studentId)
        .then((res) => setForm({ ...EMPTY_FORM, ...res.data }))
        .finally(() => setLoading(false));
    }
  }, [mode, studentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const payload = { ...form, semester: Number(form.semester) };

    try {
      let savedStudentId = studentId;

      if (mode === 'create') {
        const res = await createStudent(payload);
        savedStudentId = res.data.studentId;
      } else {
        await updateStudent(studentId, payload);
      }

      if (imageFile && savedStudentId) {
        await uploadProfileImage(savedStudentId, imageFile);
      }

      navigate(`/students/${savedStudentId}`);
    } catch (err) {
      const apiErrors = err.response?.data?.data?.errors;
      setErrors(apiErrors || [err.response?.data?.message || 'Something went wrong.']);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="muted">Loading student...</p>;

  return (
    <div className="form-page">
      <h1>{mode === 'create' ? 'Add New Student' : 'Edit Student'}</h1>

      {errors.length > 0 && (
        <div className="alert alert-error">
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="student-form">
        <label>
          Name *
          <input name="name" value={form.name} onChange={handleChange} required minLength={2} />
        </label>

        <label>
          Email *
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>
          Phone *
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+919876543210" />
        </label>

        <label>
          Course *
          <input name="course" value={form.course} onChange={handleChange} required placeholder="B.Tech CSE" />
        </label>

        <label>
          Semester *
          <input type="number" name="semester" min="1" max="12" value={form.semester} onChange={handleChange} required />
        </label>

        <label>
          Department *
          <input name="department" value={form.department} onChange={handleChange} required />
        </label>

        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} />
        </label>

        <label>
          Date of Birth
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
        </label>

        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Profile Image
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Save Changes'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
