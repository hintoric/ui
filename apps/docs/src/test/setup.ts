import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// `test.globals` is false, so Testing Library's auto-cleanup never fires on
// its own — without this, one test's DOM leaks into the next in the same file.
afterEach(() => {
  cleanup();
});

// jsdom has no matchMedia, and ColorSchemeProvider calls it to resolve
// `system`. Anything that renders a @hintoric/ui provider needs the stub.
window.matchMedia = ((query: string) => ({
  media: query,
  matches: false,
  onchange: null,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;
