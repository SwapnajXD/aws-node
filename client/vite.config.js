import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // dev only; in Docker we serve the built SPA with Nginx on :80
  server: { port: 5173 }
});