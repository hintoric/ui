import type * as React from 'react';

export interface SecurityActivity {
  /** What happened, short — "Bankverbindung geändert", "Passwort geändert". Becomes the heading and the subject. */
  title: string;
  /** Who did it. */
  actorName: string;
  occurredAt: Date;
  /**
   * Free text for this one activity — "Erika Mustermann hat die IBAN des
   * Geschäftskontos geändert.", "Neue Anmeldung von Chrome auf Windows in
   * Berlin." Replaces `messages.summary`; `messages.guidance` still follows
   * it. Plain text, escaped like everything else.
   */
  description?: string;
}

/**
 * What the activity concerns, which also decides who gets the mail:
 *
 * - `workspace` — a change in a workspace (bank details, a new admin). Sent to
 *   every admin of it.
 * - `account` — a change to one person's account (password changed, sign-in
 *   from an unknown device). Sent to that person.
 */
export type SecurityActivityTarget =
  | { type: 'workspace'; workspaceName: string }
  | { type: 'account'; email: string };

/** What every message function receives. */
export interface SecurityActivityAlertContext {
  activity: SecurityActivity;
  target: SecurityActivityTarget;
  /** The workspace name or the account's email — what is shown under the heading. */
  targetName: string;
  /** `occurredAt`, already formatted with `formatDateTime` in the given zone. */
  occurredAt: string;
}

/**
 * Every string the template shows. There are no built-in defaults — like the
 * library's other blocks, the template doesn't decide what language its
 * consumers speak. Pass `securityActivityAlertMessagesDe` /
 * `securityActivityAlertMessagesEn`, or spread one and override what differs.
 */
export interface SecurityActivityAlertMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: (ctx: SecurityActivityAlertContext) => string;
  preview: (ctx: SecurityActivityAlertContext) => string;
  /** Who did what and when, for activities without their own `description`. */
  summary: (ctx: SecurityActivityAlertContext) => string;
  /** What to do if the change wasn't expected. Follows the summary or description. */
  guidance: (ctx: SecurityActivityAlertContext) => string;
  reviewButton: string;
  /** The line under the button. `link` is the rendered link to the activity log, so word order stays the translation's. */
  activityLogHint: (link: (label: string) => React.ReactNode) => React.ReactNode;
  /** Under the card: answers "why did I get this?" — differs for workspace and account targets. */
  footer: (ctx: SecurityActivityAlertContext) => string;
  formatDateTime: (date: Date, timeZone: string) => string;
}

export interface SecurityActivityAlertProps {
  activity: SecurityActivity;
  /** The workspace or the account the activity concerns. */
  target: SecurityActivityTarget;
  /** Deep link to this one entry in the activity log. */
  reviewUrl: string;
  /** The activity log itself, shown as a link under the button. */
  activityLogUrl?: string;
  messages: SecurityActivityAlertMessages;
  /** IANA zone for `occurredAt`. Servers usually run in UTC; readers don't. */
  timeZone: string;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
