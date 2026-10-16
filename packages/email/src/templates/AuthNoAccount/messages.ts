import type { AuthNoAccountChannel, AuthNoAccountMessages, AuthNoAccountPurpose } from './types';

const requestedDe: Record<AuthNoAccountPurpose, Record<AuthNoAccountChannel, string>> = {
  recovery: { code: 'Wiederherstellungscode', link: 'Wiederherstellungslink' },
  verification: { code: 'Bestätigungscode', link: 'Bestätigungslink' },
};

export const authNoAccountMessagesDe: AuthNoAccountMessages = {
  lang: 'de',
  subject: () => 'Zu dieser Adresse gibt es kein Konto bei hintoric',
  preview: () => 'Vielleicht hast du dich mit einer anderen Adresse registriert.',
  heading: () => 'Kein Konto gefunden',
  body: ({ purpose, channel, email }) =>
    `Für ${email} wurde ein ${requestedDe[purpose][channel]} angefordert.`,
  alert: () => 'Zu dieser Adresse gibt es kein Konto bei hintoric.',
  hint: ({ channel }) =>
    `Vielleicht hast du dich mit einer anderen Adresse registriert. Wenn du den ${channel === 'link' ? 'Link' : 'Code'} nicht angefordert hast, kannst du diese E-Mail ignorieren.`,
  registerButton: 'Konto anlegen',
  footer: () => 'Du erhältst diese E-Mail, weil deine Adresse bei hintoric angegeben wurde.',
};

export const authNoAccountMessagesEn: AuthNoAccountMessages = {
  lang: 'en',
  subject: () => 'No hintoric account with this address',
  preview: () => 'Maybe you signed up with a different address.',
  heading: () => 'No account found',
  body: ({ purpose, channel, email }) => `A ${purpose === 'recovery' ? 'recovery' : 'verification'} ${channel === 'link' ? 'link' : 'code'} was requested for ${email}.`,
  alert: () => 'There is no hintoric account with this address.',
  hint: ({ channel }) =>
    `Maybe you signed up with a different address. If you didn't request the ${channel === 'link' ? 'link' : 'code'}, you can ignore this email.`,
  registerButton: 'Create an account',
  footer: () => 'We sent you this email because someone entered your address at hintoric.',
};
