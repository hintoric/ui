/**
 * Every string the template shows. There are no built-in defaults — like the
 * library's other blocks, the template doesn't decide what language its
 * consumers speak. Pass `waitlistWelcomeMessagesDe` / `waitlistWelcomeMessagesEn`,
 * or spread one and override what differs.
 */
export interface WaitlistWelcomeMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: string;
  /** The line inbox lists show after the subject. */
  preview: string;
  /** The small line above the heading. */
  eyebrow: string;
  heading: string;
  body1: string;
  body2: string;
  cta: string;
  signoff: string;
  /** Under the card: why the reader got this mail. */
  footer: string;
}

export interface WaitlistWelcomeProps {
  messages: WaitlistWelcomeMessages;
  /** Where the button leads — normally the marketing site. */
  websiteUrl: string;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
