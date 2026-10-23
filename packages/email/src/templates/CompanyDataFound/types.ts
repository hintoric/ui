/** What every message function receives. */
export interface CompanyDataFoundContext {
  /** The company name read off the website, trimmed; absent when none was found. */
  companyName?: string;
  /** The domain the details were read from — "muster-bau.de". */
  website: string;
  workspaceName: string;
}

/**
 * Every string the template shows. There are no built-in defaults — like the
 * library's other blocks, the template doesn't decide what language its
 * consumers speak. Pass `companyDataFoundMessagesDe` /
 * `companyDataFoundMessagesEn`, or spread one and override what differs.
 */
export interface CompanyDataFoundMessages {
  /** BCP 47 tag for `<html lang>`. */
  lang: string;
  subject: (ctx: CompanyDataFoundContext) => string;
  /** The line inbox lists show after the subject. */
  preview: (ctx: CompanyDataFoundContext) => string;
  heading: string;
  /** Where the details were found, and what to do with them. */
  intro: (ctx: CompanyDataFoundContext) => string;
  /** Label of the button. */
  button: string;
  /** The line under the button: nothing is taken over until the reader confirms. */
  confirmHint: string;
  /** Under the card: why the reader got this mail. */
  footer: (ctx: CompanyDataFoundContext) => string;
}

export interface CompanyDataFoundProps {
  /**
   * The company name found on the website. Optional — the discovery may find
   * the details without one, and the texts then speak of "your company".
   * Comes from a third-party page, so it is plain text, escaped like
   * everything else.
   */
  companyName?: string;
  /** The domain the details were read from — "muster-bau.de", not a URL. */
  website: string;
  /** The company settings page with the suggestion filled in. Unsafe schemes are dropped, which leaves the mail without a button. */
  reviewUrl: string;
  /** The workspace the details are for. Named in the footer. */
  workspaceName: string;
  messages: CompanyDataFoundMessages;
  /** The sender's legal line under the footer — company, address. */
  legalNotice?: string;
  /** Previews only — see `Layout`. */
  colorScheme?: 'light' | 'dark';
}
