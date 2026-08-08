import React from 'react';

/**
 * SearchFilterBar.jsx
 * -------------------
 * Controlled inputs for search (by name), filter (course/semester),
 * and sort (field + order). Lifted state - the parent page owns the
 * actual query params and re-fetches on change.
 */
export default function SearchFilterBar({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search by name..."
        value={filters.search || ''}
        onChange={(e) => update('search', e.target.value)}
      />
      <input
        type="text"
        placeholder="Filter by course"
        value={filters.course || ''}
        onChange={(e) => update('course', e.target.value)}
      />
      <input
        type="number"
        placeholder="Semester"
        min="1"
        max="12"
        value={filters.semester || ''}
        onChange={(e) => update('semester', e.target.value)}
      />
      <select value={filters.sortBy || 'name'} onChange={(e) => update('sortBy', e.target.value)}>
        <option value="name">Sort: Name</option>
        <option value="createdAt">Sort: Created Date</option>
        <option value="semester">Sort: Semester</option>
      </select>
      <select value={filters.sortOrder || 'asc'} onChange={(e) => update('sortOrder', e.target.value)}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}
