import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';

// The animated icons in a real Chromium against the real CDN and the real
// lottie-web player — jsdom has neither layout nor SVG painting. Same setup
// as @hintoric/ui's vitest.visual.config.ts, without Tailwind or @mui/joy.
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
      // Failure captures belong in .vitest-attachments/, not next to the baselines.
      screenshotFailures: false,
    },
  },
});
