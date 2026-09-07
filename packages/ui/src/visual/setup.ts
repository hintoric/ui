import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../styles/index.css';

afterEach(() => {
  cleanup();
  // The colour scheme is document state (see setColorScheme in helpers.ts), so
  // a dark test would tint every test after it without this reset.
  document.documentElement.setAttribute('data-color-scheme', 'light');
  document.documentElement.setAttribute('data-joy-color-scheme', 'light');
});

/*
 * The browser page is reused across tests in a file, so localStorage survives
 * between them. ColorSchemeProvider persists the chosen mode, which means a
 * test that switches modes silently changes the starting mode of every test
 * after it — and a screenshot baseline taken that way is unreproducible.
 */
beforeEach(() => {
  window.localStorage.clear();
});

/*
 * Without a scheme-aware page background, dark-mode screenshots of `plain` and
 * `outlined` variants show light text on a white page and are useless to
 * review.
 *
 * Scoped to dark mode on purpose. An unscoped `body { background: canvas }` is
 * white in light mode and so looks harmless, but it makes the body OPAQUE
 * where it used to be transparent — and a screenshot that captured a
 * transparent region changes from alpha to composited. ModalOverflow caught
 * this: Joy's semi-transparent backdrop went from dark to light grey, 93% of
 * pixels differing, with no layout change at all. Restricting the rule keeps
 * every existing light-mode baseline byte-identical.
 */
const canvas = document.createElement('style');
canvas.textContent = '[data-color-scheme="dark"] body { background: var(--color-canvas); }';
document.head.appendChild(canvas);
