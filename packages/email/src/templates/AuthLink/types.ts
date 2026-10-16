/**
 * Which flow asked for the link — Kratos' `verification` and `recovery`
 * templates of the `link` method, the counterparts of the code mails
 * (`AuthCode`). It picks the heading, the subject and how firmly the mail
 * warns.
 */
export type AuthLinkPurpose = 'verification' | 'recovery';

/** What every message function receives. */
export interface AuthLinkContext {
  purpose: AuthLinkPurpose;
  url: string;
  /** The address the link was sent to, when the sender knows it. */
  email?: string;
}

/**
 * Every string the template shows. There are no built-in defaults — like the
 * library's other blocks, the template doesn't decide what language its
 * consumers speak. Pass `authLinkMessagesDe` / `authLinkMessagesEn`, or
 * spread one and override what differs.
 */
export interface AuthLinkMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: (ctx: AuthLinkContext) => string;
  /** The line inbox lists show after the subject. */
  preview: (ctx: AuthLinkContext) => string;
  heading: (ctx: AuthLinkContext) => string;
  /** The sentence above the button: what it is for. */
  intro: (ctx: AuthLinkContext) => string;
  /** Label of the button. */
  button: (ctx: AuthLinkContext) => string;
  /** The line under the button. Shown only when `expiresInMinutes` is set. */
  expiry: (minutes: number) => string;
  /** What to do if the reader didn't ask for the link. */
  ignore: (ctx: AuthLinkContext) => string;
  /** Under the card: why the reader got this mail. */
  footer: (ctx: AuthLinkContext) => string;
}

export interface AuthLinkProps {
  purpose: AuthLinkPurpose;
  /** The link the flow sent — Kratos' `verification_url` or `recovery_url`. Unsafe schemes are dropped, which leaves the mail without a button. */
  url: string;
  /** The address the link was sent to. Named in the intro when given. */
  email?: string;
  /** How long the link is valid. Kratos' courier doesn't pass it; it is the flow's configured lifespan. */
  expiresInMinutes?: number;
  messages: AuthLinkMessages;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
