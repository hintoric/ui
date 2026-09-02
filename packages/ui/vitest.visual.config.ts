import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';

// Separate from vite.config.ts's jsdom unit tests: these tests render both
// the real @mui/joy package and our own components in an actual Chromium
// browser (real @mui/joy needs real CSS layout — jsdom can't do that), take
// committed screenshots via Vitest's toMatchScreenshot(), and assert
// getComputedStyle() equality between the two as the pass/fail signal.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ['**/*.visual.test.tsx'],
    globals: false,
    setupFiles: ['./src/visual/setup.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
