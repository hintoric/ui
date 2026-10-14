import type { AuthCodeMessages, AuthCodePurpose } from './types';

// The code names core's sign-in screens use (web/app/i18n), so the mail and
// the field the code goes into say the same thing.
const codeNameDe: Record<AuthCodePurpose, string> = {
  verification: 'Bestätigungscode',
  registration: 'Registrierungscode',
  login: 'Anmeldecode',
  recovery: 'Wiederherstellungscode',
};

const headingDe: Record<AuthCodePurpose, string> = {
  verification: 'Adresse bestätigen',
  registration: 'Konto anlegen',
  login: 'Anmelden',
  recovery: 'Konto wiederherstellen',
};

// Login and recovery codes open the account itself, so their mail says not
// to pass them on; the other two only confirm an address.
const grantsAccess = (purpose: AuthCodePurpose) => purpose === 'login' || purpose === 'recovery';

export const authCodeMessagesDe: AuthCodeMessages = {
  lang: 'de',
  subject: ({ purpose }) => `Dein ${codeNameDe[purpose]} für hintoric`,
  preview: ({ code }) => `Dein Code: ${code}`,
  heading: ({ purpose }) => headingDe[purpose],
  intro: ({ purpose, email }) => {
    switch (purpose) {
      case 'verification':
        return `Gib diesen Code ein, um ${email ?? 'deine E-Mail-Adresse'} zu bestätigen.`;
      case 'registration':
        return `Gib diesen Code ein, um dein Konto bei hintoric${email ? ` für ${email}` : ''} anzulegen.`;
      case 'login':
        return `Gib diesen Code ein, um dich${email ? ` als ${email}` : ''} bei hintoric anzumelden.`;
      case 'recovery':
        return `Gib diesen Code ein, um wieder auf dein Konto bei hintoric${email ? ` (${email})` : ''} zuzugreifen.`;
    }
  },
  button: ({ purpose }) => headingDe[purpose],
  expiry: (minutes) => `Der Code ist ${minutes} Minuten gültig.`,
  ignore: ({ purpose }) =>
    grantsAccess(purpose)
      ? 'Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren. Gib den Code an niemanden weiter – hintoric fragt dich nie danach.'
      : 'Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.',
  footer: () => 'Du erhältst diese E-Mail, weil mit deiner Adresse ein Code bei hintoric angefordert wurde.',
};

const codeNameEn: Record<AuthCodePurpose, string> = {
  verification: 'verification code',
  registration: 'registration code',
  login: 'sign-in code',
  recovery: 'recovery code',
};

const headingEn: Record<AuthCodePurpose, string> = {
  verification: 'Confirm your address',
  registration: 'Create your account',
  login: 'Sign in',
  recovery: 'Recover your account',
};

export const authCodeMessagesEn: AuthCodeMessages = {
  lang: 'en',
  subject: ({ purpose }) => `Your hintoric ${codeNameEn[purpose]}`,
  preview: ({ code }) => `Your code: ${code}`,
  heading: ({ purpose }) => headingEn[purpose],
  intro: ({ purpose, email }) => {
    switch (purpose) {
      case 'verification':
        return `Enter this code to confirm ${email ?? 'your email address'} for your hintoric account.`;
      case 'registration':
        return `Enter this code to create your hintoric account${email ? ` for ${email}` : ''}.`;
      case 'login':
        return `Enter this code to sign in to hintoric${email ? ` as ${email}` : ''}.`;
      case 'recovery':
        return `Enter this code to get back into your hintoric account${email ? ` (${email})` : ''}.`;
    }
  },
  button: ({ purpose }) => headingEn[purpose],
  expiry: (minutes) => `The code is valid for ${minutes} minutes.`,
  ignore: ({ purpose }) =>
    grantsAccess(purpose)
      ? "If you didn't request this, you can ignore this email. Don't share the code with anyone – hintoric will never ask you for it."
      : "If you didn't request this, you can ignore this email.",
  footer: () => 'We sent you this email because someone requested a code for your address at hintoric.',
};
