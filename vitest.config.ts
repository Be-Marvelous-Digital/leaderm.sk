import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: { modules: { localsConvention: 'camelCaseOnly' } },
  test: { environment: 'jsdom', setupFiles: ['src/test-setup.ts'], include: ['src/**/*.test.{ts,tsx}'] },
});
