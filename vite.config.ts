import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const adminSlash: Plugin = {
  name: 'admin-trailing-slash',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url !== '/admin' && !req.url?.startsWith('/admin?')) return next();
      res.writeHead(301, { Location: '/admin/' + req.url.slice(6) }).end();
    });
  },
};

export default defineConfig({
  plugins: [react(), adminSlash],
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
