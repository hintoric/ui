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
 */
beforeEach(() => {
  window.localStorage.clear();
});
