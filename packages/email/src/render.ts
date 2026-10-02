import type * as React from 'react';
import { render } from '@react-email/render';

export interface RenderedEmailBody {
  html: string;
  /** The plain-text part. Multipart mails without one score worse with spam filters. */
  text: string;
}

/** Renders an email element — normally a `<Layout>` — to HTML and plain text. */
export async function renderEmail(element: React.ReactElement): Promise<RenderedEmailBody> {
  const [html, text] = await Promise.all([render(element), render(element, { plainText: true })]);
  return { html, text };
}
