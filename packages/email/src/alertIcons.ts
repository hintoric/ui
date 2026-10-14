import { EMAIL_COLORS, EMAIL_VARIANTS, variantTokens, type EmailColor, type EmailScheme, type EmailVariant } from './tokens';

/**
 * The icon an Alert shows for its colour — the same as @hintoric/ui's
 * `ALERT_ICON_FOR_COLOR`, which the parity tests compare it with.
 */
export const EMAIL_ALERT_ICON_FOR_COLOR = {
  primary: 'info',
  neutral: 'info',
  danger: 'report',
  success: 'check-circle',
  warning: 'warning',
} as const satisfies Record<EmailColor, string>;

export type EmailAlertIconName = (typeof EMAIL_ALERT_ICON_FOR_COLOR)[EmailColor];

/*
 * Mail clients can't colour an image, so every icon exists once per text
 * colour it is drawn in: a PNG at twice the largest size it is shown at
 * (24px), hosted on the CDN. The files come from scripts/alert-icons.mjs.
 */
export const EMAIL_ALERT_ICON_BASE = 'https://cdn.hintoric.com/assets/email/alert';

export function emailAlertIconUrl(name: EmailAlertIconName, ink: string): string {
  return `${EMAIL_ALERT_ICON_BASE}/${name}-${ink.replace('#', '').toLowerCase()}.png`;
}

/** The icon for an alert of this variant and colour, in the scheme's ink. */
export function emailAlertIcon(scheme: EmailScheme, variant: EmailVariant, color: EmailColor): { name: EmailAlertIconName; ink: string; url: string } {
  const name = EMAIL_ALERT_ICON_FOR_COLOR[color];
  const ink = variantTokens(scheme, variant, color).color!;
  return { name, ink, url: emailAlertIconUrl(name, ink) };
}

/** Every icon file an Alert can ask for — what has to be on the CDN. */
export function emailAlertIconFiles(): { name: EmailAlertIconName; ink: string; file: string; url: string }[] {
  const files = new Map<string, { name: EmailAlertIconName; ink: string; file: string; url: string }>();
  for (const scheme of ['light', 'dark'] as const) {
    for (const variant of EMAIL_VARIANTS) {
      for (const color of EMAIL_COLORS) {
        const { name, ink, url } = emailAlertIcon(scheme, variant, color);
        files.set(url, { name, ink, url, file: url.slice(EMAIL_ALERT_ICON_BASE.length + 1) });
      }
    }
  }
  return [...files.values()];
}
