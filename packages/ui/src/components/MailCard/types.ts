import type * as React from 'react';
import type { MailCardMessages } from './messages';
import type {
  CardSpec,
  MailCardActionData,
  MailCardAlternative,
  MailCardIconName,
  MailCardRowData,
  MailCardStatusTone,
} from './spec';

export interface MailCardProps {
  /**
   * The card as blocks, as Core sends it. The card runs it through `parseCardSpec` itself, so JSON
   * forwarded with a cast cannot crash the page: what the parser cannot use is dropped, and a spec
   * that is no card (no header with a title) renders nothing. A valid spec renders as given.
   * Ignored when there are `children`. When present it wins over `jsonLd`, even if it is no card;
   * pass `parseCardSpec(card) ?? undefined` to let `jsonLd` take over then.
   */
  spec?: CardSpec;
  /**
   * A schema.org object from the mail (JSON-LD), mapped with `jsonLdToSpec`. Ignored when there are
   * `children` or a `spec`. A type that does not map, or one missing a required field, renders
   * nothing.
   */
  jsonLd?: unknown;
  /** The card composed from the block components, which takes precedence over `spec` and `jsonLd`. */
  children?: React.ReactNode;
  /** Whose layout the blocks follow. `outlook` comes later. @default 'google' */
  provider?: 'google';
  /**
   * Whose look: colours, font, surface. `joy` is the library's own tokens; `google` is Gmail's
   * measured values and font (its dark values are provisional until measured on a dark Gmail).
   * @default 'joy'
   */
  theme?: 'joy' | 'google';
  /**
   * The colour scheme to paint in. `'dark'` is all either theme needs to turn dark: it sets
   * `data-color-scheme` on the card and picks the dark values of the theme, with no
   * `ColorSchemeProvider` required, so it works inside a shadow root.
   *
   * Without it the card follows the `ColorSchemeProvider` above it. With neither, `joy` follows the
   * page (its tokens follow `data-color-scheme`), and `google`, whose colours are concrete values
   * and not tokens, is light.
   *
   * `'light'` cannot turn a `joy` card light inside a dark document: the library's light tokens live
   * only on `:root`, so a light island in a dark page stays dark. It is light wherever the page
   * around it is not dark — a shadow root in an unmarked host such as Gmail included. A `google`
   * card has no such limit: its values are concrete, and `'light'` makes it light on any page.
   */
  colorScheme?: 'light' | 'dark';
  /** Every string the card shows that is not in its input — the package ships no translations. */
  messages: MailCardMessages;
  /** Formats dates and amounts. Falls back to the `DateTimeProvider` / `LocaleProvider` locale. */
  locale?: string;
  /** The Hintoric mark in front of the title. Without it the text keeps its edge. @default true */
  showLogo?: boolean;
  /**
   * Called by an `offer` action: without an argument from the button itself, with the chosen
   * variant from the menu of a split button.
   */
  onOffer?(alternative?: MailCardAlternative): void;
  /** Called with the reader's answer to the `feedback` question. */
  onFeedback?(answer: 'yes' | 'no'): void;
  className?: string;
}

export interface MailCardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export interface MailCardRowsProps {
  /** `MailCardRow`s. They fill two columns, left to right. */
  children?: React.ReactNode;
  className?: string;
}

export interface MailCardRowProps extends MailCardRowData {
  className?: string;
}

export interface MailCardFooterProps {
  /**
   * Actions or a status, aligned right. The feedback block goes first and keeps to the left.
   */
  children?: React.ReactNode;
  className?: string;
}

export interface MailCardActionProps {
  /** Primary: a pill button. Otherwise a text link. A `url` opens in a new tab. */
  action: MailCardActionData;
  className?: string;
}

/** What the feedback block shows besides the question; the package ships no translations. */
export interface MailCardFeedbackLabels {
  /** `aria-label` of the thumbs-up button. */
  yes: string;
  /** `aria-label` of the thumbs-down button. */
  no: string;
  /** Shown in place of the question and the buttons once an answer is given. */
  thanks: string;
}

export interface MailCardFeedbackProps {
  /** The question, in the reader's language ("Ist das richtig?"). */
  question: string;
  /**
   * Called once, with the reader's answer. Inside a `MailCard` it defaults to the card's
   * `onFeedback`; without either the answer is only acknowledged.
   */
  onAnswer?(answer: 'yes' | 'no'): void;
  /**
   * Inside a `MailCard` it defaults to the card's `messages` (`feedbackYes`, `feedbackNo`,
   * `feedbackThanks`). Without either there is nothing to name the buttons with, and nothing is
   * rendered.
   */
  labels?: MailCardFeedbackLabels;
  className?: string;
}

export interface MailCardStatusProps {
  /** What happened, in the passive ("Bestätigung wurde ausgestellt und versendet."). */
  label: string;
  tone: MailCardStatusTone;
  className?: string;
}

export interface MailCardIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: MailCardIconName;
}

export type MailCardLogoProps = React.SVGProps<SVGSVGElement>;
