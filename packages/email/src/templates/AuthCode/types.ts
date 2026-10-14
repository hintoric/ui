/**
 * Which flow asked for the code — Kratos' `verification_code`,
 * `recovery_code`, `login_code` and `registration_code` templates. It picks
 * the heading, the subject and how firmly the mail warns.
 */
export type AuthCodePurpose = 'verification' | 'recovery' | 'login' | 'registration';

/** What every message function receives. */
export interface AuthCodeContext {
  purpose: AuthCodePurpose;
  code: string;
  /** The address the code was sent to, when the sender knows it. */
  email?: string;
}

/**
 * Every string the template shows. There are no built-in defaults — like the
 * library's other blocks, the template doesn't decide what language its
 * consumers speak. Pass `authCodeMessagesDe` / `authCodeMessagesEn`, or
 * spread one and override what differs.
 */
export interface AuthCodeMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: (ctx: AuthCodeContext) => string;
  /** The line inbox lists show after the subject. */
  preview: (ctx: AuthCodeContext) => string;
  heading: (ctx: AuthCodeContext) => string;
  /** The sentence above the code: what it is for. */
  intro: (ctx: AuthCodeContext) => string;
  /** Label of the button. Shown only when `url` is set. */
  button: (ctx: AuthCodeContext) => string;
  /** The line under the code. Shown only when `expiresInMinutes` is set. */
  expiry: (minutes: number) => string;
  /** What to do if the reader didn't ask for the code. */
  ignore: (ctx: AuthCodeContext) => string;
  /** Under the card: why the reader got this mail. */
  footer: (ctx: AuthCodeContext) => string;
}

export interface AuthCodeProps {
  purpose: AuthCodePurpose;
  /** The one-time code, shown as it is: Kratos sends six digits. */
  code: string;
  /** The address the code was sent to. Named in the intro when given. */
  email?: string;
  /**
   * A link that does what entering the code does — Kratos' verification URL,
   * which carries the code. Adds a button under the code; unsafe schemes are
   * dropped.
   */
  url?: string;
  /** How long the code is valid. Kratos' courier doesn't pass it; it is the flow's configured lifespan. */
  expiresInMinutes?: number;
  messages: AuthCodeMessages;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
