import type * as React from 'react';

/*
 * A theme is nothing but values for the `--mail-card-*` properties the blocks paint with, set
 * inline on the card root. `blocks.tsx`, `SplitAction.tsx` and `classes.ts` read them with
 * `var(--mail-card-…)` and know no colour of their own, so a theme never has to restyle a block.
 *
 * Every theme must set every property in every scheme: a `var()` whose property is unset is
 * invalid at computed-value time, which drops the whole declaration — the text would silently fall
 * back to the inherited colour. The `Record` type below makes a forgotten one a compile error, and
 * `themes.test.ts` reads the variables out of the sources to check the values at run time.
 */
type MailCardVariable =
  // The card: fill, 1 px border, elevation, and the font all text inherits.
  | '--mail-card-surface'
  | '--mail-card-border'
  | '--mail-card-shadow'
  | '--mail-card-font'
  // Text: the title, the values, and the labels, subtitle, feedback question and neutral status.
  | '--mail-card-title'
  | '--mail-card-text'
  | '--mail-card-label'
  // The primary pill: fill, its hover and press states, the text on it, and the focus ring.
  | '--mail-card-accent'
  | '--mail-card-accent-hover'
  | '--mail-card-accent-active'
  | '--mail-card-on-accent'
  | '--mail-card-focus'
  // Text links, and the rule above the footer.
  | '--mail-card-link'
  | '--mail-card-rule'
  // The menu of a split button, and the wash behind a highlighted menu item or icon button.
  | '--mail-card-menu-surface'
  | '--mail-card-menu-shadow'
  | '--mail-card-menu-hover'
  // Status text by tone (`neutral` takes the label colour).
  | '--mail-card-success'
  | '--mail-card-warning'
  | '--mail-card-danger';

type MailCardThemeValues = Record<MailCardVariable, string>;

export type MailCardThemeName = 'joy' | 'google';
export type MailCardScheme = 'light' | 'dark';

/*
 * `joy` is the library's own look, from the tokens `Card` (outlined, neutral), the ink scale and a
 * solid primary `Button` use — and so it follows `data-color-scheme` the way they do, which is why
 * it has one set of values for both schemes. Text colours as in the reference screenshot of the
 * card: title ink-primary, values ink-secondary, subtitle and labels ink-tertiary, and the rule is
 * the library's divider. The pill takes the solid primary button's fill, hover, press and focus
 * ring. Text links take the plain primary colour (500 light, 300 dark): primary-500 as text on the
 * dark surface is about 3.7:1, below the 4.5:1 that 14 px text needs. The menu of a split button is
 * a joy `Menu`: it paints with the popup surface (white in light, black in dark) and `shadow.md`,
 * and the item under the pointer or the keyboard takes the plain neutral hover background of a
 * `MenuItem`; its border is the card's. Status tones are the plain tone colours of `Typography`
 * and `Chip` (500 light, 300 dark).
 */
const JOY: MailCardThemeValues = {
  '--mail-card-surface': 'var(--color-surface)',
  '--mail-card-border': 'var(--color-neutral-outlined-border)',
  '--mail-card-shadow': 'none',
  '--mail-card-font': 'var(--font-body)',
  '--mail-card-title': 'var(--color-ink-primary)',
  '--mail-card-text': 'var(--color-ink-secondary)',
  '--mail-card-label': 'var(--color-ink-tertiary)',
  '--mail-card-accent': 'var(--color-primary-solid-bg)',
  '--mail-card-accent-hover': 'var(--color-primary-solid-hover-bg)',
  '--mail-card-accent-active': 'var(--color-primary-solid-active-bg)',
  '--mail-card-on-accent': 'var(--color-primary-solid-color)',
  '--mail-card-focus': 'var(--color-primary-500)',
  '--mail-card-link': 'var(--color-primary-plain-color)',
  '--mail-card-rule': 'var(--color-divider)',
  '--mail-card-menu-surface': 'var(--color-surface-popup)',
  '--mail-card-menu-shadow': 'var(--shadow-md)',
  '--mail-card-menu-hover': 'var(--color-neutral-plain-hover-bg)',
  '--mail-card-success': 'var(--color-success-plain-color)',
  '--mail-card-warning': 'var(--color-warning-plain-color)',
  '--mail-card-danger': 'var(--color-danger-plain-color)',
};

/*
 * `google` follows Gmail. Gmail has no status line, so the three tones are not measurable there:
 * they are the library's own tone colours, as in `joy` — the colours its plain tokens resolve to,
 * 500 in light and 300 in dark. They are written as those palette steps rather than as the plain
 * tokens (`--color-success-plain-color`, …): the plain tokens flip with the *document's*
 * `data-color-scheme`, and a google card follows its own scheme, so it must not take the wrong
 * half in a page of the other one. The palette steps are not redefined for dark.
 * `scripts/MailCardTones.test.ts` reads `theme.css` and fails if the steps and the plain tokens
 * ever part ways.
 *
 * Both schemes keep the card's 1 px border, only transparent: Gmail's card has none, and the same
 * box in every theme means switching scheme or theme never moves a pixel of the layout.
 */
const GOOGLE_FONT = '"Google Sans", Roboto, Arial, sans-serif';

// Light. Measured on Gmail web, 19.10.2026 (mail-cards design spec, "Provider-Layout google"):
// surface, shadow, title, subtitle and label, value, link, font; the rule is Gmail's own
// outline-variant token as it resolves in Gmail. Everything marked "derived" is computed from one
// of those.
const GOOGLE_ACCENT = '#1a73e8'; // measured: link colour, and Gmail's blue for the primary fill
const GOOGLE_LABEL = '#5f6368'; // measured: subtitle and label
const GOOGLE_SHADOW = '0 1px 2px rgba(60,64,67,.3), 0 2px 6px 2px rgba(60,64,67,.15)'; // measured

const GOOGLE_LIGHT: MailCardThemeValues = {
  '--mail-card-surface': '#fff', // measured
  '--mail-card-border': 'transparent', // Gmail's card has no border; see above
  '--mail-card-shadow': GOOGLE_SHADOW, // measured
  '--mail-card-font': GOOGLE_FONT, // measured
  '--mail-card-title': '#222', // measured
  '--mail-card-text': '#202124', // measured: value
  '--mail-card-label': GOOGLE_LABEL, // measured: subtitle and label
  '--mail-card-accent': GOOGLE_ACCENT,
  // derived: the accent mixed with 12 % (hover) and 20 % (press) black, the direction in which a
  // solid `Button` of the library changes too
  '--mail-card-accent-hover': `color-mix(in srgb, ${GOOGLE_ACCENT} 88%, #000)`,
  '--mail-card-accent-active': `color-mix(in srgb, ${GOOGLE_ACCENT} 80%, #000)`,
  '--mail-card-on-accent': '#fff', // derived: white on the accent fill, 4.5:1
  '--mail-card-focus': GOOGLE_ACCENT, // derived: the accent
  '--mail-card-link': GOOGLE_ACCENT, // measured
  '--mail-card-rule': '#c4c7c5', // Gmail's outline-variant, read over CDP from Gmail's resolved tokens on 2026-10-19
  '--mail-card-menu-surface': '#fff', // derived: the card's surface
  '--mail-card-menu-shadow': GOOGLE_SHADOW, // derived: the card's shadow
  '--mail-card-menu-hover': `color-mix(in srgb, ${GOOGLE_LABEL} 10%, transparent)`, // derived: the label colour at 10 %, Material's focus state layer
  '--mail-card-success': 'var(--color-success-500)', // the library's tone colour, see above
  '--mail-card-warning': 'var(--color-warning-500)',
  '--mail-card-danger': 'var(--color-danger-500)',
};

// Dark. Same roles, same geometry.
//
// TODO(mail-card): PROVISIONAL — Gmail was in its light theme on 2026-10-19, so these are Gmail's
// GM3 dark tokens read from its stylesheet over CDP, mapped by role. Re-measure the computed styles
// of a Gmail card with Gmail's dark theme on.
//
// Not measured in either scheme, even in light: hover and active of the pill, the focus ring, and
// the menu's surface, shadow and hover. They are derived from a measured value (the accent mixed
// with black, the card's own surface and shadow, the label colour at 10 %) or mapped to a GM3
// role, because a Gmail card has no split menu to measure. Re-check the dark menu in particular:
// #1e1f20 (surface-container) on the card's #282a2c (surface-container-high) is one step apart
// and may not read as a separate surface; it may need a lighter fill or a visible border.
//
// This comment is the only record in the repo of where these values came from. Light: Gmail web,
// computed styles and resolved tokens read over CDP on 2026-10-19, in Gmail's light theme. Dark:
// GM3 dark system tokens from Gmail's stylesheet, mapped by role. The measurements themselves
// (the mail-cards design spec, "Provider-Layout google") live outside this repository.
const GOOGLE_DARK_ACCENT = '#a8c7fa'; // GM3 primary (dark)
const GOOGLE_DARK_LABEL = '#c4c7c5'; // GM3 on-surface-variant (dark)
const GOOGLE_DARK_SHADOW = '0 1px 2px rgba(0,0,0,.3), 0 2px 6px 2px rgba(0,0,0,.15)'; // same geometry, GM3 shadow #000

const GOOGLE_DARK: MailCardThemeValues = {
  '--mail-card-surface': '#282a2c', // GM3 surface-container-high: a card one step above Gmail's #131314
  '--mail-card-border': 'transparent',
  '--mail-card-shadow': GOOGLE_DARK_SHADOW,
  '--mail-card-font': GOOGLE_FONT,
  '--mail-card-title': '#e3e3e3', // GM3 on-surface
  '--mail-card-text': '#e3e3e3', // GM3 on-surface
  '--mail-card-label': GOOGLE_DARK_LABEL,
  '--mail-card-accent': GOOGLE_DARK_ACCENT,
  // derived, as in light: 12 % and 20 % black into the accent
  '--mail-card-accent-hover': `color-mix(in srgb, ${GOOGLE_DARK_ACCENT} 88%, #000)`,
  '--mail-card-accent-active': `color-mix(in srgb, ${GOOGLE_DARK_ACCENT} 80%, #000)`,
  '--mail-card-on-accent': '#062e6f', // GM3 on-primary
  '--mail-card-focus': GOOGLE_DARK_ACCENT, // derived: the accent
  '--mail-card-link': GOOGLE_DARK_ACCENT, // GM3 primary
  '--mail-card-rule': '#444746', // GM3 outline-variant
  '--mail-card-menu-surface': '#1e1f20', // GM3 surface-container: a menu sits below the card, as joy's black popup does
  '--mail-card-menu-shadow': GOOGLE_DARK_SHADOW, // derived: the card's shadow
  '--mail-card-menu-hover': `color-mix(in srgb, ${GOOGLE_DARK_LABEL} 10%, transparent)`, // derived: the label colour at 10 %
  '--mail-card-success': 'var(--color-success-300)', // the library's tone colour in dark, see above
  '--mail-card-warning': 'var(--color-warning-300)',
  '--mail-card-danger': 'var(--color-danger-300)',
};

const THEMES: Record<MailCardThemeName, Record<MailCardScheme, MailCardThemeValues>> = {
  joy: { light: JOY, dark: JOY },
  google: { light: GOOGLE_LIGHT, dark: GOOGLE_DARK },
};

/**
 * The `--mail-card-*` custom properties of `theme` in `scheme`, ready for the card root's `style`.
 * The same object every time for the same pair. A theme name it does not know (an untyped host)
 * gets `joy`.
 */
export function mailCardThemeStyle(
  theme: MailCardThemeName,
  scheme: MailCardScheme,
): React.CSSProperties {
  const schemes = Object.hasOwn(THEMES, theme) ? THEMES[theme] : THEMES.joy;
  // Custom properties are not in `CSSProperties`; React sets them through `setProperty`.
  return schemes[scheme === 'dark' ? 'dark' : 'light'] as React.CSSProperties;
}
