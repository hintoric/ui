import type { CookieConsentLabels } from './types';

const DEFAULT_LABELS: Required<CookieConsentLabels> = {
  bannerTitle: 'Allow cookies?',
  bannerText: 'Some cookies are needed for the site. All others are only set with your consent.',
  reject: 'Reject',
  accept: 'Allow',
  customize: 'Choose individually',
  settingsTitle: 'Choose cookies',
  settingsText: 'You can change your choice at any time.',
  alwaysOn: 'Always on',
  save: 'Save selection',
  acceptAll: 'Allow all',
  privacy: 'Privacy policy',
  close: 'Close',
};

/*
 * English defaults, partially overridable — the library ships no translations,
 * the same line the colour scheme labels draw.
 */
export function resolveCookieConsentLabels(labels?: CookieConsentLabels): Required<CookieConsentLabels> {
  const resolved = { ...DEFAULT_LABELS };
  for (const key of Object.keys(DEFAULT_LABELS) as (keyof CookieConsentLabels)[]) {
    const label = labels?.[key];
    if (label != null) Object.assign(resolved, { [key]: label });
  }
  return resolved;
}
