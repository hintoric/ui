import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../styles/index.css';

afterEach(() => {
  cleanup();
});

/*
 * The browser page is reused across tests in a file, so localStorage survives
 * between them. ColorSchemeProvider persists the chosen mode, which means a
 * test that switches modes silently changes the starting mode of every test
 * after it — and a screenshot baseline taken that way is unreproducible.
 * Joy's own provider does the same under the key `joy-mode`.
 */
beforeEach(() => {
  window.localStorage.clear();
});

/*
 * The document-level scheme attribute outlives a test too, for the same
 * reason. Reset it so a file's tests cannot depend on their own order.
 *
 * The body background is part of that state — setColorScheme paints it for
 * dark and clears it for light, and it must go back to cleared here. See the
 * comment on setColorScheme for why light deliberately has no painted page
 * background.
 */
afterEach(() => {
  document.documentElement.setAttribute('data-color-scheme', 'light');
  document.documentElement.setAttribute('data-joy-color-scheme', 'light');
  document.body.style.background = '';
});
