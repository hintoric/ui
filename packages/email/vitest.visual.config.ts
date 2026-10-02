import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

// Renders every email component next to its @hintoric/ui web counterpart in a
// real Chromium and asserts getComputedStyle() equality between the two — the
// web component is the oracle here, the way @mui/joy is for packages/ui. The
// web side comes from @hintoric/ui's built dist/ (components + styles.css), so
// build it first: `pnpm --filter @hintoric/ui build`.
export default defineConfig({
  plugins: [react()],
  test: {
    include: ['**/*.visual.test.tsx'],
    globals: false,
    setupFiles: ['./src/visual/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
      // As in packages/ui: __screenshots__ holds only deliberate baselines.
      screenshotFailures: false,
    },
  },
});
