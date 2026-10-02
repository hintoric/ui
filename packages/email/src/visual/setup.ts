import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
// The web side of every parity test: @hintoric/ui's published stylesheet.
import '@hintoric/ui/styles.css';

afterEach(() => {
  cleanup();
  // The colour scheme is document state (see setColorScheme), so a dark test
  // would tint every test after it without this reset.
  document.documentElement.setAttribute('data-color-scheme', 'light');
});

// As in packages/ui: without a scheme-aware page, dark screenshots of plain and
// outlined variants show light text on a white page. Scoped to dark so light
// baselines keep their transparent background.
const canvas = document.createElement('style');
canvas.textContent = '[data-color-scheme="dark"] body { background: var(--color-canvas); }';
document.head.appendChild(canvas);
