/**
 * studentApi.js
 * -------------
 * Thin axios wrapper around the backend REST API. Every function
 * returns `response.data` directly (the standard { status, message,
 * data, timestamp, requestId } envelope) so components can destructure
 * `.data` for the actual payload.
 */

import axios from 'axios';

// In dev, the Vite proxy (vite.config.js) forwards '/api' to the
// backend, so a relative base URL works both in dev and once built
// & served behind the same domain/reverse proxy in production.
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({ baseURL, timeout: 10000 });

export const getStudents = (params) => client.get('/students', { params }).then((r) => r.data);

export const getStudentById = (studentId) =>
  client.get(`/students/${studentId}`).then((r) => r.data);

export const createStudent = (payload) =>
  client.post('/students', payload).then((r) => r.data);

export const updateStudent = (studentId, payload) =>
  client.put(`/students/${studentId}`, payload).then((r) => r.data);

export const deleteStudent = (studentId) =>
  client.delete(`/students/${studentId}`).then((r) => r.data);

export const uploadProfileImage = (studentId, file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  return client
    .post(`/students/${studentId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export default client;
