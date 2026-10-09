import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8080', changeOrigin: false } } },
  build: {
    rollupOptions: {
      input: {
        site: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
      },
    },
  },
});
