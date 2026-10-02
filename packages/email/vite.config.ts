import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), dts({ include: ['src'], exclude: ['src/test/**', 'src/visual/**', '**/*.test.*'], rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // react-email and its renderer stay normal dependencies rather than
      // being bundled: they are what a mail server already installs, and
      // react-email's renderer reaches for react-dom/server, which must be the
      // consumer's own copy. Exact-specifier matching, as in packages/ui.
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/server', 'react-email', '@react-email/render'],
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // Parity with the web components runs separately via `pnpm test:visual`
    // (real browser), see vitest.visual.config.ts.
    exclude: ['**/node_modules/**', '**/*.visual.test.tsx'],
  },
});
