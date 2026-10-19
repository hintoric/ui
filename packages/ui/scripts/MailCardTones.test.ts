import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mailCardThemeStyle } from '../src/components/MailCard/themes';

// In `scripts/` because it reads `theme.css` from disk: vitest's CSS handling turns a CSS import
// into an empty string inside `src`, and `src` is typed without Node.
const css = readFileSync(resolve(import.meta.dirname, '../src/styles/theme.css'), 'utf8');
const darkStart = css.indexOf('[data-color-scheme="dark"] {');
const light = css.slice(0, darkStart);
const dark = css.slice(darkStart, css.indexOf('\n}', darkStart));

const plain = (block: string, tone: string) =>
  new RegExp(`--color-${tone}-plain-color:\\s*(var\\(--color-${tone}-\\d+\\))`).exec(block)?.[1];

// The `google` status colours name palette steps, not the plain tokens, because the plain tokens
// flip with the *document's* `data-color-scheme` and a card can be in another scheme than its
// page. Pinned here: the steps are exactly what the plain tokens resolve to in each scheme, so the
// card's tones are the library's own and a change in `theme.css` fails here instead of drifting.
describe('MailCard google status colours', () => {
  it('finds the light and the dark block of theme.css', () => {
    expect(darkStart).toBeGreaterThan(0);
    expect(light).toContain('--color-success-plain-color:');
    expect(dark).toContain('--color-success-plain-color:');
  });

  it.each(['success', 'warning', 'danger'] as const)(
    'paints %s with what the plain colour resolves to in light and in dark',
    (tone) => {
      expect(plain(light, tone)).toBe(`var(--color-${tone}-500)`);
      expect(plain(dark, tone)).toBe(`var(--color-${tone}-300)`);
      expect(mailCardThemeStyle('google', 'light')).toHaveProperty(
        `--mail-card-${tone}`,
        plain(light, tone),
      );
      expect(mailCardThemeStyle('google', 'dark')).toHaveProperty(
        `--mail-card-${tone}`,
        plain(dark, tone),
      );
    },
  );

  it('never redefines those palette steps for dark, so they do not move with the document', () => {
    for (const tone of ['success', 'warning', 'danger']) {
      for (const step of [500, 300]) {
        expect(dark).not.toMatch(new RegExp(`--color-${tone}-${step}:`));
      }
    }
  });
});
