import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest.config's `test.globals` is intentionally `false` (tests use explicit
// imports), which means Testing Library's own auto-cleanup detection never
// fires. Register it explicitly, otherwise DOM nodes from one test's render()
// leak into the next test in the same file.
afterEach(() => {
  cleanup();
});

/*
 * jsdom implements no matchMedia at all, and ColorSchemeProvider calls it to
 * resolve `system`. A stub that reports "not dark" and records its listeners
 * lets a test drive an OS-level change: flip `matches` and notify, which is
 * what `setSystemDark` below does.
 */
export const matchMediaState = {
  matches: false,
  listeners: new Set<(event: MediaQueryListEvent) => void>(),
};

beforeEach(() => {
  matchMediaState.matches = false;
  matchMediaState.listeners.clear();
});

window.matchMedia = ((query: string) => ({
  media: query,
  get matches() {
    return matchMediaState.matches;
  },
  onchange: null,
  addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
    matchMediaState.listeners.add(listener);
  },
  removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
    matchMediaState.listeners.delete(listener);
  },
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

/** Flips the simulated OS preference and notifies every subscriber. */
export function setSystemDark(dark: boolean): void {
  matchMediaState.matches = dark;
  for (const listener of matchMediaState.listeners) {
    listener({ matches: dark } as MediaQueryListEvent);
  }
}
