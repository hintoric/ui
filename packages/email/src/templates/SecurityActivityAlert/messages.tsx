import type { SecurityActivityAlertMessages } from './types';

function dateTimeFormatter(locale: string, suffix = '') {
  return (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short', timeZone }).format(date) + suffix;
}

export const securityActivityAlertMessagesDe: SecurityActivityAlertMessages = {
  lang: 'de',
  subject: ({ activity, targetName }) => `${activity.title} – ${targetName}`,
  preview: ({ activity, occurredAt }) => (activity.actorName ? `${activity.actorName} · ${occurredAt}` : occurredAt),
  summary: ({ activity, target, occurredAt }) =>
    activity.actorName
      ? `${activity.actorName} hat am ${occurredAt} etwas geändert, das die Sicherheit betrifft.`
      : `Am ${occurredAt} wurde etwas ${target.type === 'account' ? 'an deinem Konto ' : ''}geändert, das die Sicherheit betrifft.`,
  guidance: ({ target }) =>
    target.type === 'account' ? 'Wenn du das nicht warst, sichere dein Konto jetzt.' : 'Wenn du diese Änderung nicht erwartet hast, prüfe die Aktivität jetzt.',
  reviewButton: ({ target }) => (target.type === 'account' ? 'Konto prüfen' : 'Aktivität prüfen'),
  activityLogHint: (link) => <>Alle sicherheitsrelevanten Aktivitäten findest du im {link('Aktivitätsprotokoll')}.</>,
  footer: ({ target }) =>
    target.type === 'workspace'
      ? 'Du erhältst diese E-Mail, weil du diesen Workspace verwaltest.'
      : 'Du erhältst diese E-Mail, weil sie dein Konto bei hintoric betrifft.',
  // DIN 5008: the time takes "Uhr" — "28. September 2026 um 19:31 Uhr".
  formatDateTime: dateTimeFormatter('de-DE', ' Uhr'),
};

export const securityActivityAlertMessagesEn: SecurityActivityAlertMessages = {
  lang: 'en',
  subject: ({ activity, targetName }) => `${activity.title} – ${targetName}`,
  preview: ({ activity, occurredAt }) => (activity.actorName ? `${activity.actorName} · ${occurredAt}` : occurredAt),
  summary: ({ activity, target, occurredAt }) =>
    activity.actorName
      ? `${activity.actorName} made a security-relevant change on ${occurredAt}.`
      : `Something security-relevant changed ${target.type === 'account' ? 'on your account ' : ''}on ${occurredAt}.`,
  guidance: ({ target }) =>
    target.type === 'account' ? "If this wasn't you, secure your account now." : "If you didn't expect this change, review the activity now.",
  reviewButton: ({ target }) => (target.type === 'account' ? 'Review account' : 'Review activity'),
  activityLogHint: (link) => <>You can see all security-relevant activity in the {link('activity log')}.</>,
  footer: ({ target }) =>
    target.type === 'workspace'
      ? 'We sent you this email to let you know, as an admin, about important changes in your workspace.'
      : 'We sent you this email to let you know about important changes to your hintoric account.',
  formatDateTime: dateTimeFormatter('en-GB'),
};
