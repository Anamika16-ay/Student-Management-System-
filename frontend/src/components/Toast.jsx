import React, { useEffect } from 'react';

/**
 * Toast.jsx
 * ---------
 * Simple auto-dismissing notification banner for success/error
 * messages returned by the API's standard response envelope.
 */
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} role="alert">
      {message}
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}
