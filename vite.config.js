import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/benable-brand-prototype-v43/',
  server: {
    host: '127.0.0.1',
    port: 5216,
    proxy: {
      '/images': { target: 'https://benable.com', changeOrigin: true, secure: true },
      '/static': { target: 'https://benable.com', changeOrigin: true, secure: true },
      '/uploads': { target: 'https://benable.com', changeOrigin: true, secure: true },
      '/api':     { target: 'https://benable.com', changeOrigin: true, secure: true },
    },
  },
});
