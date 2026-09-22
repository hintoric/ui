import { defineConfig, devices } from '@playwright/test';

// End-to-end tests drive the real docs app in a real browser: the published
// package as a consumer imports it, the real router, the real network. That
// is the layer neither the jsdom suite nor the component-level browser suite
// in packages/ui can reach.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  // `channel: 'chromium'` reuses the full Chromium that packages/ui's visual
  // suite already installs, instead of pulling a second headless-shell build.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
  webServer: {
    // The docs import @hintoric/ui from its built dist/, which is what makes
    // these tests end-to-end — but Vite pre-bundles that dependency and keys
    // the cache on the lockfile, not on dist's contents. Without --force a
    // rebuilt library is silently ignored and the suite tests stale code.
    command: 'pnpm dev --port 5199 --strictPort --force',
    url: 'http://localhost:5199',
    // Never reused: an already-running server was started without --force
    // and its Vite dep cache can still hold the previous build of the
    // library, which is the one thing these tests must not test.
    reuseExistingServer: false,
    stdout: 'ignore',
  },
});
