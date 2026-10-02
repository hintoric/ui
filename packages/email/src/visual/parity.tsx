import * as React from 'react';
import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Head, Html } from 'react-email';
import { ColorSchemeStyles, renderEmail } from '../index';

/*
 * Email parity: the web component is the oracle here, the way @mui/joy is the
 * oracle for the web components, and their computed styles must match
 * property by property.
 *
 * The email side is measured in what is actually sent: the document
 * renderEmail produces — react-email's XHTML 1.0 Transitional doctype
 * included — loaded into an iframe. Rendering it into this HTML5 test page
 * instead is not equivalent: that doctype puts the browser in "almost
 * standards" mode, which lays out inline content differently, and Button
 * once measured right here while every sent button came out 4px short.
 *
 * What cannot match is left out on purpose, with the reason in each test:
 * email has no flexbox (display differs), no :hover/:focus a client honours,
 * and no `gap`.
 */

export type StyleProp = keyof CSSStyleDeclaration & string;

const PADDING = 16;

async function emailDocument(email: React.ReactNode, width: number): Promise<string> {
  // The scheme is document state in these tests; the email document gets the
  // same attribute so its own stylesheet switches with the page.
  const scheme = document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light';
  const { html } = await renderEmail(
    <Html lang="de" data-color-scheme={scheme}>
      <Head>
        <ColorSchemeStyles />
      </Head>
      <body style={{ margin: 0, padding: PADDING }}>
        <div data-testid="email-root" style={{ width }}>
          {email}
        </div>
      </body>
    </Html>,
  );
  return html;
}

/**
 * Writes `html` into the frame with document.write, not `srcdoc`: a srcdoc
 * document is always in no-quirks mode by spec, whatever its doctype, so it
 * would skip exactly the mode real mail is shown in. react-email's
 * XHTML 1.0 Transitional doctype yields limited-quirks mode (which still
 * reports `compatMode === 'CSS1Compat'`), and a webmail that drops the
 * doctype gives full quirks; in both, an inline box's line-height no longer
 * props up a line the way it does in a srcdoc frame.
 */
export async function writeEmailDocument(frame: HTMLIFrameElement, html: string): Promise<Document> {
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  // Remote images (the logo) settle the layout only once loaded.
  // A failed load settles it too, so an offline run fails on pixels, not on a hang.
  await Promise.all(
    [...doc.images].map((img) =>
      img.complete
        ? undefined
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          }),
    ),
  );
  frame.style.height = `${doc.documentElement.scrollHeight}px`;
  return doc;
}

/**
 * Renders `web` into this page and `email` into a real email document beside
 * it. `web` / `email` are each side's first element; `webRoot` and the
 * iframe (`data-testid="email"`) are what the screenshot baselines capture.
 */
export async function renderPair(web: React.ReactNode, email: React.ReactNode, width = 320, { quirks = false } = {}) {
  // `quirks`: the document as a webmail that drops the doctype shows it.
  const rendered = await emailDocument(email, width);
  const html = quirks ? rendered.replace(/^<!DOCTYPE[^>]*>/i, '') : rendered;
  // Stacked, not side by side: the test viewport is 414px wide, and a flex row
  // would shrink the web column below `width` and wrap its text.
  render(
    <div>
      <div style={{ padding: PADDING }}>
        <div data-testid="web" style={{ width }}>
          {web}
        </div>
      </div>
      <iframe data-testid="email" title="email" style={{ width: width + PADDING * 2, border: 0, display: 'block' }} />
    </div>,
  );
  const doc = await writeEmailDocument(screen.getByTestId('email') as HTMLIFrameElement, html);
  return {
    webRoot: screen.getByTestId('web'),
    web: screen.getByTestId('web').firstElementChild as HTMLElement,
    email: doc.querySelector('[data-testid="email-root"]')!.firstElementChild as HTMLElement,
    emailDocument: doc,
  };
}

/** Each element is read in its own document's window — the email side lives in the iframe. */
function styleOf(element: Element): CSSStyleDeclaration {
  return element.ownerDocument.defaultView!.getComputedStyle(element);
}

/** One expectation per property, labelled, so a failure names the property instead of dumping two objects. */
export function expectSameStyles(web: Element, email: Element, props: StyleProp[]) {
  const w = styleOf(web);
  const e = styleOf(email);
  for (const prop of props) {
    expect(`${prop}: ${e[prop] as string}`).toBe(`${prop}: ${w[prop] as string}`);
  }
}

/** Box size, to the half pixel: line-height plus padding has to land where min-height plus flexbox does. */
export function expectSameBox(web: Element, email: Element, { width = true, height = true } = {}) {
  const w = web.getBoundingClientRect();
  const e = email.getBoundingClientRect();
  if (height) expect(Math.abs(e.height - w.height), `height ${e.height} vs ${w.height}`).toBeLessThanOrEqual(0.5);
  if (width) expect(Math.abs(e.width - w.width), `width ${e.width} vs ${w.width}`).toBeLessThanOrEqual(0.5);
}

// borderTopStyle is deliberately absent: Tailwind's preflight gives every web
// element `border: 0 solid`, while an email element without a border reports
// `none`. With the width at 0 both draw nothing, and the width is compared.
export const COLOR_PROPS: StyleProp[] = ['backgroundColor', 'color', 'borderTopColor', 'borderTopWidth'];
export const FONT_PROPS: StyleProp[] = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];
