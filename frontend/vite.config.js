import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the browser talks to /api on the SAME origin; Vite forwards it to Express.
    // That keeps cookies simple (SameSite=Lax works) and avoids CORS problems.
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
