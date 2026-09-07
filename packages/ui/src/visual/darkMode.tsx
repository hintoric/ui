import type * as React from 'react';
import { render } from '@testing-library/react';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy';
import { ColorSchemeProvider } from '../theme/ColorSchemeProvider';

/*
 * Two things have to be dark at once for a comparison to mean anything, and
 * they use different mechanisms:
 *
 * - Joy's CssVarsProvider emits `[data-joy-color-scheme="dark"]` selectors, so
 *   an element carrying that attribute switches its whole subtree. We cannot
 *   use `defaultMode="dark"` instead: that writes the attribute onto <html>,
 *   which is shared, so a light and a dark Joy element could not coexist in
 *   one test document.
 * - Ours reads `[data-color-scheme="dark"]`, set by ColorSchemeProvider from
 *   its resolved mode. Passing the attribute directly on a wrapper skips the
 *   provider's own resolution, which is what we want here — this suite tests
 *   token parity, not mode resolution (that is covered in jsdom).
 *
 * Portalled content (Menu, Select's listbox) mounts outside these wrappers and
 * therefore does NOT inherit them — for those, drive the real provider instead.
 *
 * Two mechanisms therefore coexist, on purpose:
 *
 * - These wrapper scopes, for tests that show a light and a dark element
 *   together in one document (DarkTokens' grid). `defaultMode="dark"` cannot
 *   do that — it writes onto the shared <html>.
 * - `setColorScheme()` in helpers.ts, which is document-level and is what the
 *   per-component suite uses, because that suite must cover portalled
 *   components and a wrapper cannot reach them.
 */
export function renderJoyLight(node: React.ReactNode): void {
  render(
    <JoyCssVarsProvider>
      <div data-joy-color-scheme="light">{node}</div>
    </JoyCssVarsProvider>,
  );
}

export function renderJoyDark(node: React.ReactNode): void {
  render(
    <JoyCssVarsProvider>
      <div data-joy-color-scheme="dark">{node}</div>
    </JoyCssVarsProvider>,
  );
}

export function renderHintoricLight(node: React.ReactNode): void {
  render(
    <ColorSchemeProvider>
      <div data-color-scheme="light">{node}</div>
    </ColorSchemeProvider>,
  );
}

export function renderHintoricDark(node: React.ReactNode): void {
  render(
    <ColorSchemeProvider>
      <div data-color-scheme="dark">{node}</div>
    </ColorSchemeProvider>,
  );
}
