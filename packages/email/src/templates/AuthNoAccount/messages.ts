import type { AuthNoAccountMessages } from './types';

export const authNoAccountMessagesDe: AuthNoAccountMessages = {
  lang: 'de',
  subject: () => 'Kein hintoric-Konto mit dieser Adresse',
  preview: ({ email }) => `Für ${email} gibt es kein hintoric-Konto.`,
  heading: () => 'Kein Konto gefunden',
  body: ({ purpose, email }) =>
    purpose === 'recovery'
      ? `Jemand – vermutlich du – wollte das hintoric-Konto zu ${email} wiederherstellen.`
      : `Jemand – vermutlich du – wollte die Adresse ${email} bei hintoric bestätigen.`,
  alert: ({ email }) => `Mit ${email} gibt es kein hintoric-Konto.`,
  hint: () => 'Vielleicht hast du dich mit einer anderen Adresse registriert. Wenn du das nicht warst, kannst du diese E-Mail ignorieren.',
  registerButton: 'Konto anlegen',
  footer: () => 'Wir haben dir diese E-Mail gesendet, weil bei hintoric jemand deine Adresse angegeben hat.',
};

export const authNoAccountMessagesEn: AuthNoAccountMessages = {
  lang: 'en',
  subject: () => 'No hintoric account with this address',
  preview: ({ email }) => `There is no hintoric account for ${email}.`,
  heading: () => 'No account found',
  body: ({ purpose, email }) =>
    purpose === 'recovery'
      ? `Someone – probably you – tried to recover the hintoric account for ${email}.`
      : `Someone – probably you – tried to confirm the address ${email} at hintoric.`,
  alert: ({ email }) => `There is no hintoric account with ${email}.`,
  hint: () => "Maybe you signed up with a different address. If this wasn't you, you can ignore this email.",
  registerButton: 'Create an account',
  footer: () => 'We sent you this email because someone entered your address at hintoric.',
};
