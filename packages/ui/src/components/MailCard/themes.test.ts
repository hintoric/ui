/// <reference types="vite/client" />
import { describe, expect, it } from 'vitest';
import { mailCardThemeStyle } from './themes';

const THEMES = ['joy', 'google'] as const;
const SCHEMES = ['light', 'dark'] as const;
const COMBINATIONS = THEMES.flatMap((theme) => SCHEMES.map((scheme) => [theme, scheme] as const));

// Every variable any block or the menu paints with: read out of the sources, so a variable that
// is added to a block and forgotten in a theme fails here. (An unset `var()` is invalid at
// computed-value time, which silently drops the whole declaration.)
const SOURCES = import.meta.glob(['./*.{ts,tsx}', '!./*.test.*'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const PAINTED_WITH = [
  ...new Set(
    Object.values(SOURCES).flatMap((source) =>
      Array.from(source.matchAll(/var\((--mail-card-[a-z-]+)\)/g), (match) => match[1]),
    ),
  ),
].sort();

/** WCAG contrast ratio of two hex colours (`#rgb` or `#rrggbb`). */
function contrast(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    expect(hex).toMatch(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    const full = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
    const [r, g, b] = [1, 3, 5].map((i) => {
      const channel = parseInt(full.slice(i, i + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe('mailCardThemeStyle', () => {
  it('finds the variables the card paints with', () => {
    // A floor, not an exact count: it only has to prove the scan below is not scanning nothing.
    expect(PAINTED_WITH).toEqual(
      expect.arrayContaining([
        '--mail-card-surface',
        '--mail-card-accent',
        '--mail-card-menu-hover',
        '--mail-card-success',
        '--mail-card-warning',
        '--mail-card-danger',
      ]),
    );
  });

  it.each(COMBINATIONS)('%s / %s sets every variable the card paints with', (theme, scheme) => {
    const style = mailCardThemeStyle(theme, scheme) as Record<string, string>;
    for (const name of PAINTED_WITH) {
      expect(style[name], `${theme}/${scheme} lacks ${name}`).toEqual(expect.any(String));
      expect(style[name].trim(), `${theme}/${scheme} has an empty ${name}`).not.toBe('');
    }
  });

  it.each(COMBINATIONS)('%s / %s sets nothing the card does not paint with', (theme, scheme) => {
    const style = mailCardThemeStyle(theme, scheme) as Record<string, string>;
    expect(Object.keys(style).sort()).toEqual(PAINTED_WITH);
  });

  it('gives the joy theme the same token references in both schemes', () => {
    // They flip with `[data-color-scheme="dark"]` by themselves.
    expect(mailCardThemeStyle('joy', 'dark')).toEqual(mailCardThemeStyle('joy', 'light'));
  });

  it('gives a theme it does not know the joy values', () => {
    expect(mailCardThemeStyle('outlook' as never, 'dark')).toBe(mailCardThemeStyle('joy', 'dark'));
  });

  it('keeps one box model: the google border stays 1px wide, only transparent', () => {
    for (const scheme of SCHEMES) {
      expect(mailCardThemeStyle('google', scheme)).toHaveProperty(
        '--mail-card-border',
        'transparent',
      );
    }
  });

  it('takes the joy status colours from the library’s plain tone tokens', () => {
    for (const scheme of SCHEMES) {
      expect(mailCardThemeStyle('joy', scheme)).toMatchObject({
        '--mail-card-success': 'var(--color-success-plain-color)',
        '--mail-card-warning': 'var(--color-warning-plain-color)',
        '--mail-card-danger': 'var(--color-danger-plain-color)',
      });
    }
  });

  it('paints the google status with palette steps, which do not move with the document', () => {
    // Not the plain tokens: those flip with the *document's* `data-color-scheme`, so a google card
    // in another scheme than its page would get the wrong half. That the steps are what the
    // plain tokens resolve to is pinned in `scripts/MailCardTones.test.ts`, which can read theme.css.
    expect(mailCardThemeStyle('google', 'light')).toMatchObject({
      '--mail-card-success': 'var(--color-success-500)',
      '--mail-card-warning': 'var(--color-warning-500)',
      '--mail-card-danger': 'var(--color-danger-500)',
    });
    expect(mailCardThemeStyle('google', 'dark')).toMatchObject({
      '--mail-card-success': 'var(--color-success-300)',
      '--mail-card-warning': 'var(--color-warning-300)',
      '--mail-card-danger': 'var(--color-danger-300)',
    });
  });

  it.each(SCHEMES)('keeps the google text readable on its surface (%s)', (scheme) => {
    const style = mailCardThemeStyle('google', scheme) as Record<string, string>;
    const surface = style['--mail-card-surface'];
    // Plain text needs 4.5:1 (WCAG 1.4.3): every text colour on the card and on the menu, and the
    // pill's text on its fill.
    const pairs: [string, string][] = [
      ['--mail-card-title', surface],
      ['--mail-card-text', surface],
      ['--mail-card-label', surface],
      ['--mail-card-link', surface],
      ['--mail-card-link', style['--mail-card-menu-surface']],
      ['--mail-card-title', style['--mail-card-menu-surface']],
      ['--mail-card-label', style['--mail-card-menu-surface']],
      ['--mail-card-on-accent', style['--mail-card-accent']],
    ];
    for (const [foreground, background] of pairs) {
      expect(
        contrast(style[foreground], background),
        `${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});
