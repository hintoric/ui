import {
  EMAIL_COLORS,
  EMAIL_VARIANTS,
  emailSchemes,
  mainColor,
  variantTokens,
  type EmailColor,
  type EmailVariant,
} from './tokens';

/*
 * Inline styles carry the light scheme, so an email always renders correctly
 * even where <style> is stripped. Dark mode is a progressive enhancement: each
 * painted element also carries a class from here, and the stylesheet below
 * overrides it — `!important` because it has to beat the inline value.
 *
 * Two triggers, deliberately:
 *   - `prefers-color-scheme: dark`, which Apple Mail, iOS Mail, Outlook for
 *     Mac and Thunderbird honour. Guarded by `:not([data-color-scheme="light"])`
 *     so a preview forced to light stays light on a dark OS.
 *   - `[data-color-scheme="dark"]` on any ancestor — the same switch the
 *     component library uses, so an email component rendered inside the docs
 *     or a visual test follows the page's scheme.
 *
 * Gmail and Outlook.com ignore both and apply their own colour inversion,
 * which is out of any template's control.
 */
export const emailClass = {
  variant: (variant: EmailVariant, color: EmailColor) => `hx-${variant}-${color}`,
  main: (color: EmailColor) => `hx-main-${color}`,
  inkPrimary: 'hx-ink-1',
  inkSecondary: 'hx-ink-2',
  inkTertiary: 'hx-ink-3',
  inkIcon: 'hx-ink-icon',
  surface: 'hx-surface',
  divider: 'hx-divider',
  // Layout's AuthScreen shell: page and card swap surfaces in dark.
  layoutCanvas: 'hx-layout-canvas',
  layoutCard: 'hx-layout-card',
  // A logo pair: the light one shows by default, the dark one only once the
  // dark rules apply — clients without <style> support keep the light logo.
  logoLight: 'hx-logo-light',
  logoDark: 'hx-logo-dark',
} as const;

function darkRules(scope: string): string {
  const t = emailSchemes.dark;
  const rule = (selector: string, body: string) => `${scope} .${selector}{${body}}`;
  const rules = [
    rule(emailClass.inkPrimary, `color:${t.inkPrimary}!important;`),
    rule(emailClass.inkSecondary, `color:${t.inkSecondary}!important;`),
    rule(emailClass.inkTertiary, `color:${t.inkTertiary}!important;`),
    rule(emailClass.inkIcon, `color:${t.inkIcon}!important;`),
    rule(emailClass.surface, `background-color:${t.surface}!important;`),
    rule(emailClass.divider, `background-color:${t.divider}!important;`),
    rule(emailClass.layoutCanvas, `background-color:${t.surface}!important;`),
    // react-email's Body repeats its inline style on an inner wrapper cell
    // that carries no class, so the canvas colour has to reach it too.
    rule(`${emailClass.layoutCanvas}>table>tbody>tr>td`, `background-color:${t.surface}!important;`),
    rule(emailClass.logoLight, 'display:none!important;'),
    rule(emailClass.logoDark, 'display:inline-block!important;'),
    rule(emailClass.layoutCard,`background-color:${t.surface1}!important;border-color:${variantTokens('dark', 'outlined', 'neutral').borderColor}!important;`),
  ];
  for (const color of EMAIL_COLORS) {
    rules.push(rule(emailClass.main(color), `color:${mainColor('dark', color)}!important;`));
    for (const variant of EMAIL_VARIANTS) {
      const v = variantTokens('dark', variant, color);
      rules.push(
        rule(
          emailClass.variant(variant, color),
          [
            `color:${v.color}!important;`,
            v.backgroundColor && `background-color:${v.backgroundColor}!important;`,
            v.borderColor && `border-color:${v.borderColor}!important;`,
          ]
            .filter(Boolean)
            .join(''),
        ),
      );
    }
  }
  return rules.join('');
}

export const emailStylesheet = [
  // iOS turns dates and addresses into blue links that ignore the text colour.
  'a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;}',
  // AuthScreen's phone layout: the card stops being a card and fills the screen.
  `@media only screen and (max-width:600px){.${emailClass.layoutCard}{padding:32px 24px!important;border-radius:0!important;border:0!important;}}`,
  `@media (prefers-color-scheme:dark){${darkRules(':root:not([data-color-scheme="light"])')}}`,
  darkRules('[data-color-scheme="dark"]'),
].join('\n');
