import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-server proxy forwards /api and /uploads to the Express backend
// so the frontend can call relative paths without CORS friction while
// developing locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
