/**
 * The flows that answer an unknown address with a mail of their own instead
 * of an error — Kratos' `verification_code.invalid` and
 * `recovery_code.invalid`. Saying "no such account" on screen would tell
 * anyone which addresses have one; the mail tells only the address's owner.
 */
export type AuthNoAccountPurpose = 'verification' | 'recovery';

/** What every message function receives. */
export interface AuthNoAccountContext {
  purpose: AuthNoAccountPurpose;
  email: string;
}

/**
 * Every string the template shows. Pass `authNoAccountMessagesDe` /
 * `authNoAccountMessagesEn`, or spread one and override what differs.
 */
export interface AuthNoAccountMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: (ctx: AuthNoAccountContext) => string;
  /** The line inbox lists show after the subject. */
  preview: (ctx: AuthNoAccountContext) => string;
  heading: (ctx: AuthNoAccountContext) => string;
  /** What was attempted. */
  body: (ctx: AuthNoAccountContext) => string;
  /** That the address has no account — the warning alert under the body. */
  alert: (ctx: AuthNoAccountContext) => string;
  /** The likely explanation, and what to do if it wasn't the reader. */
  hint: (ctx: AuthNoAccountContext) => string;
  /** Label of the button. Shown only when `registrationUrl` is set. */
  registerButton: string;
  /** Under the card: why the reader got this mail. */
  footer: (ctx: AuthNoAccountContext) => string;
}

export interface AuthNoAccountProps {
  purpose: AuthNoAccountPurpose;
  /** The address that was entered — the one this mail goes to. */
  email: string;
  /** Where to create an account. Adds a button; unsafe schemes are dropped. */
  registrationUrl?: string;
  messages: AuthNoAccountMessages;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
