import { afterEach, beforeEach } from 'vitest';
import { commands } from 'vitest/browser';
import { cleanup } from '@testing-library/react';
import '../styles/index.css';
import './commands';

// The pointer stays where the last hover left it — possibly in another file —
// and whatever renders under it next comes up in :hover. Park it first.
beforeEach(async () => {
  await commands.resetPointer();
});

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
 * Screenshots are taken on the page a consumer's components sit on: the
 * canvas, in both schemes. Without it, dark-mode `plain`/`outlined` variants
 * show light text on a white page, and the light-mode default Card — white
 * and borderless, made to sit on the warm canvas — is invisible.
 *
 * This used to be dark-only, to keep the light baselines byte-identical: an
 * opaque body turns a screenshot's transparent regions from alpha into
 * composited colour (ModalOverflow's semi-transparent backdrop changed 93% of
 * its pixels with no layout change). Every baseline was retaken for the
 * KLM-inspired look, which is when the light half was added.
 */
const canvas = document.createElement('style');
canvas.textContent = 'body { background: var(--color-canvas); }';
document.head.appendChild(canvas);
