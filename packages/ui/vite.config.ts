import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'], exclude: ['src/test/**', 'src/visual/**', '**/*.test.*'], rollupTypes: true })],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        '@base-ui/react',
      ],
      output: {
        assetFileNames: (asset) => (asset.names?.[0]?.endsWith('.css') ? 'style.css' : '[name][extname]'),
      },
    },
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // Visual comparison tests run separately via `pnpm test:visual` (real
    // browser + real @mui/joy, see vitest.visual.config.ts) — jsdom can't
    // render either faithfully enough to compare computed styles.
    exclude: ['**/node_modules/**', '**/*.visual.test.tsx'],
  },
});
