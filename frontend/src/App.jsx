import React from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import StudentListPage from './pages/StudentListPage.jsx';
import StudentFormPage from './pages/StudentFormPage.jsx';
import StudentDetailsPage from './pages/StudentDetailsPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">🎓 Student Management System</Link>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Students
          </NavLink>
          <NavLink to="/students/new" className={({ isActive }) => (isActive ? 'active' : '')}>
            + Add Student
          </NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<StudentListPage />} />
          <Route path="/students/new" element={<StudentFormPage mode="create" />} />
          <Route path="/students/:studentId" element={<StudentDetailsPage />} />
          <Route path="/students/:studentId/edit" element={<StudentFormPage mode="edit" />} />
        </Routes>
      </main>

      <footer className="footer">
        MERN Student Management System &copy; 2026
      </footer>
    </div>
  );
}
