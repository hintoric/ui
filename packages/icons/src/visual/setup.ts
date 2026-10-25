import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
  // The colour scheme is document state, so a dark test would tint every test after it.
  document.documentElement.setAttribute('data-color-scheme', 'light');
  document.documentElement.removeAttribute('data-reduced-motion');
  document.body.style.background = '';
});

export type ColorScheme = 'light' | 'dark';
export const COLOR_SCHEMES = ['light', 'dark'] as const;

/** Scheme on <html>, as @hintoric/ui's ColorSchemeProvider sets it, plus a page background to review dark screenshots against. */
export function setColorScheme(scheme: ColorScheme): void {
  document.documentElement.setAttribute('data-color-scheme', scheme);
  document.body.style.background = scheme === 'dark' ? '#0b0d0e' : '';
}
