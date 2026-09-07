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
      // country-flag-icons IS external, unlike Base UI: it is a plain ESM
      // barrel of SVG components with no CJS fallback to trip over, and
      // bundling it would add ~229 kB minified (~52 kB gzipped) to every
      // consumer, including the ones that never render a LocaleSwitcher.
      // Left external, it stays a normal dependency and drops out
      // entirely for anyone who tree-shakes LocaleSwitcher away.
      // react-hook-form and zod are peerDependencies and MUST be external.
      // This list is exact-specifier matched, so an omission silently bundles
      // a second copy — and a second react-hook-form module instance makes
      // useFormContext() return null in the consumer's app, which takes
      // behaviour away without throwing anything. zod is here because
      // @hookform/resolvers/zod imports it; the resolver itself stays bundled,
      // since its version is coupled to both and consumers shouldn't have to
      // track that.
      external: [
        'react',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom',
        'country-flag-icons/react/1x1',
        'react-hook-form',
        'zod',
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
