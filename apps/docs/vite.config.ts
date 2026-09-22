import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { docsIndex } from './docsIndexPlugin.ts';

export default defineConfig({
  plugins: [react(), docsIndex()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // `e2e/` belongs to Playwright (`pnpm test:e2e`); its specs import
    // @playwright/test, which throws the moment vitest loads one.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
