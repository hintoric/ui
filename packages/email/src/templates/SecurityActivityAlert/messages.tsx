import type { SecurityActivityAlertMessages } from './types';

function dateTimeFormatter(locale: string) {
  return (date: Date, timeZone: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short', timeZone }).format(date);
}

export const securityActivityAlertMessagesDe: SecurityActivityAlertMessages = {
  lang: 'de',
  subject: ({ activity, targetName }) => `${activity.title} – ${targetName}`,
  preview: ({ activity, occurredAt }) => `${activity.actorName} · ${occurredAt}`,
  summary: ({ activity, occurredAt }) => `${activity.actorName} hat am ${occurredAt} eine sicherheitsrelevante Änderung vorgenommen.`,
  guidance: () => 'Wenn du diese Änderung nicht erwartet hast, prüfe die Aktivität jetzt.',
  reviewButton: 'Aktivität prüfen',
  activityLogHint: (link) => <>Alle sicherheitsrelevanten Aktivitäten findest du im {link('Aktivitätsprotokoll')}.</>,
  footer: ({ target }) =>
    target.type === 'workspace'
      ? 'Wir haben dir diese E-Mail gesendet, um dich als Administrator über wichtige Änderungen in deinem Workspace zu informieren.'
      : 'Wir haben dir diese E-Mail gesendet, um dich über wichtige Änderungen an deinem hintoric-Konto zu informieren.',
  formatDateTime: dateTimeFormatter('de-DE'),
};

export const securityActivityAlertMessagesEn: SecurityActivityAlertMessages = {
  lang: 'en',
  subject: ({ activity, targetName }) => `${activity.title} – ${targetName}`,
  preview: ({ activity, occurredAt }) => `${activity.actorName} · ${occurredAt}`,
  summary: ({ activity, occurredAt }) => `${activity.actorName} made a security-relevant change on ${occurredAt}.`,
  guidance: () => "If you didn't expect this change, review the activity now.",
  reviewButton: 'Review activity',
  activityLogHint: (link) => <>You can see all security-relevant activity in the {link('activity log')}.</>,
  footer: ({ target }) =>
    target.type === 'workspace'
      ? 'We sent you this email to let you know, as an admin, about important changes in your workspace.'
      : 'We sent you this email to let you know about important changes to your hintoric account.',
  formatDateTime: dateTimeFormatter('en-GB'),
};
