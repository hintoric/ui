/**
 * Every user-facing string `MailCard` needs that is not in its input.
 *
 * `@hintoric/ui` ships no translations, so the host passes these in — in the reader's language. The
 * `schemaOrg` part covers cards built from schema.org markup, whose labels and titles the markup
 * does not carry. The titles are functions because word order differs between languages.
 */
export type MailCardMessages = {
  /** `aria-label` of the arrow next to the primary button. */
  moreActions: string;
  /** `aria-label` of the thumbs-up button. */
  feedbackYes: string;
  /** `aria-label` of the thumbs-down button. */
  feedbackNo: string;
  /** Shown once an answer is given. */
  feedbackThanks: string;
  schemaOrg: {
    labels: Record<
      | 'amount'
      | 'validUntil'
      | 'seller'
      | 'number'
      | 'provider'
      | 'account'
      | 'dueDate'
      | 'merchant'
      | 'orderNumber'
      | 'item'
      | 'carrier'
      | 'expectedArrival'
      | 'trackingNumber',
      string
    >;
    offerTitle(p: { name: string; seller: string }): string;
    invoiceTitle(p: { provider: string }): string;
    orderTitle(p: { merchant: string; orderNumber: string }): string;
    parcelTitle(p: { carrier: string; item?: string }): string;
    /** Link label for `url`. */
    view: string;
    /** Link label for `trackingUrl`. */
    track: string;
  };
};
