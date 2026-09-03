import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'], exclude: ['src/test/**', 'src/visual/**', '**/*.test.*'], rollupTypes: true })],
  resolve: {
    alias: [
      // Trailing `$` for an exact-specifier match — without it Vite treats
      // the key as a path prefix and also rewrites the unrelated
      // `use-sync-external-store/shim/with-selector` subpath onto this file.
      // See the aliased files themselves for why these exist.
      { find: /^use-sync-external-store\/shim$/, replacement: resolve(import.meta.dirname, 'src/internal/use-sync-external-store-shim.ts') },
      { find: /^use-sync-external-store\/shim\/with-selector$/, replacement: resolve(import.meta.dirname, 'src/internal/use-sync-external-store-with-selector-shim.ts') },
    ],
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // @base-ui/react is intentionally NOT external: our components import
      // its deep subpaths (@base-ui/react/select, /menu, /combobox, etc.),
      // which are different module specifiers than the bare '@base-ui/react'
      // string — Rollup's `external` does exact-specifier matching, so those
      // subpaths silently stayed bundled anyway while the (unused) bare
      // specifier was excluded. That partial bundling pulled in Base UI's
      // vendored floating-ui-react code, which has a CJS `require('react')`
      // fallback that throws at runtime in a browser ESM context. Consumers
      // never import Base UI directly (it's purely an internal
      // implementation detail), so there's no reason to also require them to
      // install it as a peer — bundle it fully instead, like every other
      // dependency here.
      external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom'],
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
