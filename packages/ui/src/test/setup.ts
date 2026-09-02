import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// vitest.config's `test.globals` is intentionally `false` (tests use explicit
// imports), which means Testing Library's own auto-cleanup detection never
// fires. Register it explicitly, otherwise DOM nodes from one test's render()
// leak into the next test in the same file.
afterEach(() => {
  cleanup();
});
