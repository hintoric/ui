import type { AuthNoAccountMessages } from './types';

export const authNoAccountMessagesDe: AuthNoAccountMessages = {
  lang: 'de',
  subject: () => 'Zu dieser Adresse gibt es kein Konto bei hintoric',
  preview: () => 'Vielleicht hast du dich mit einer anderen Adresse registriert.',
  heading: () => 'Kein Konto gefunden',
  body: ({ purpose, email }) => `Für ${email} wurde ein ${purpose === 'recovery' ? 'Wiederherstellungscode' : 'Bestätigungscode'} angefordert.`,
  alert: () => 'Zu dieser Adresse gibt es kein Konto bei hintoric.',
  hint: () => 'Vielleicht hast du dich mit einer anderen Adresse registriert. Wenn du den Code nicht angefordert hast, kannst du diese E-Mail ignorieren.',
  registerButton: 'Konto anlegen',
  footer: () => 'Du erhältst diese E-Mail, weil deine Adresse bei hintoric angegeben wurde.',
};

export const authNoAccountMessagesEn: AuthNoAccountMessages = {
  lang: 'en',
  subject: () => 'No hintoric account with this address',
  preview: () => 'Maybe you signed up with a different address.',
  heading: () => 'No account found',
  body: ({ purpose, email }) => `A ${purpose === 'recovery' ? 'recovery' : 'verification'} code was requested for ${email}.`,
  alert: () => 'There is no hintoric account with this address.',
  hint: () => "Maybe you signed up with a different address. If you didn't request the code, you can ignore this email.",
  registerButton: 'Create an account',
  footer: () => 'We sent you this email because someone entered your address at hintoric.',
};
