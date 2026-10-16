import type { AuthLinkMessages, AuthLinkPurpose } from './types';

const linkNameDe: Record<AuthLinkPurpose, string> = {
  verification: 'Bestätigungslink',
  recovery: 'Wiederherstellungslink',
};

// The same headings as the code mails, so the two flows read alike.
const headingDe: Record<AuthLinkPurpose, string> = {
  verification: 'Adresse bestätigen',
  recovery: 'Konto wiederherstellen',
};

export const authLinkMessagesDe: AuthLinkMessages = {
  lang: 'de',
  subject: ({ purpose }) => `Dein ${linkNameDe[purpose]} für hintoric`,
  preview: ({ purpose }) =>
    purpose === 'verification' ? 'Bestätige deine E-Mail-Adresse mit einem Klick.' : 'Greife mit einem Klick wieder auf dein Konto zu.',
  heading: ({ purpose }) => headingDe[purpose],
  intro: ({ purpose, email }) =>
    purpose === 'verification'
      ? `Klicke auf den Button, um ${email ?? 'deine E-Mail-Adresse'} zu bestätigen.`
      : `Klicke auf den Button, um wieder auf dein Konto bei hintoric${email ? ` (${email})` : ''} zuzugreifen.`,
  button: ({ purpose }) => headingDe[purpose],
  expiry: (minutes) => `Der Link ist ${minutes} Minuten gültig.`,
  // A recovery link opens the account itself; a verification link only confirms an address.
  ignore: ({ purpose }) =>
    purpose === 'recovery'
      ? 'Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren. Gib den Link an niemanden weiter – hintoric fragt dich nie danach.'
      : 'Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.',
  footer: () => 'Du erhältst diese E-Mail, weil mit deiner Adresse ein Link bei hintoric angefordert wurde.',
};

const linkNameEn: Record<AuthLinkPurpose, string> = {
  verification: 'verification link',
  recovery: 'recovery link',
};

const headingEn: Record<AuthLinkPurpose, string> = {
  verification: 'Confirm your address',
  recovery: 'Recover your account',
};

export const authLinkMessagesEn: AuthLinkMessages = {
  lang: 'en',
  subject: ({ purpose }) => `Your hintoric ${linkNameEn[purpose]}`,
  preview: ({ purpose }) => (purpose === 'verification' ? 'Confirm your email address with one click.' : 'Get back into your account with one click.'),
  heading: ({ purpose }) => headingEn[purpose],
  intro: ({ purpose, email }) =>
    purpose === 'verification'
      ? `Click the button to confirm ${email ?? 'your email address'} for your hintoric account.`
      : `Click the button to get back into your hintoric account${email ? ` (${email})` : ''}.`,
  button: ({ purpose }) => headingEn[purpose],
  expiry: (minutes) => `The link is valid for ${minutes} minutes.`,
  ignore: ({ purpose }) =>
    purpose === 'recovery'
      ? "If you didn't request this, you can ignore this email. Don't share the link with anyone – hintoric will never ask you for it."
      : "If you didn't request this, you can ignore this email.",
  footer: () => 'We sent you this email because someone requested a link for your address at hintoric.',
};
