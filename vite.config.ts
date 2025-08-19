import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 👈 this is critical for access from other devices (like your phone)
    port: 5173,      // optional: change port if needed
  },
});
