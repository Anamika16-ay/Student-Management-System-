import React from 'react';

/**
 * Pagination.jsx
 * --------------
 * Renders Prev/Next controls plus a page indicator, driven entirely by
 * the pagination metadata the backend returns (page, totalPages,
 * hasNextPage).
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn btn-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Prev
      </button>
      <span>
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <button
        className="btn btn-sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </div>
  );
}
