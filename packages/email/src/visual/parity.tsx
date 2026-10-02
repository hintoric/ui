import * as React from 'react';
import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorSchemeStyles } from '../index';

/*
 * Email parity: the web component is the oracle here, the way @mui/joy is the
 * oracle for the web components. Each email component is rendered next to its
 * web counterpart in the same document — with the email stylesheet mounted,
 * so `data-color-scheme="dark"` reaches both — and their computed styles must
 * match property by property.
 *
 * What cannot match is left out on purpose, with the reason in each test:
 * email has no flexbox (display differs), no :hover/:focus a client honours,
 * and no `gap`.
 */

export type StyleProp = keyof CSSStyleDeclaration & string;

export function renderPair(web: React.ReactNode, email: React.ReactNode, width = 320) {
  render(
    <div style={{ display: 'flex', gap: 24, padding: 16 }}>
      <ColorSchemeStyles />
      <div data-testid="web" style={{ width }}>
        {web}
      </div>
      <div data-testid="email" style={{ width }}>
        {email}
      </div>
    </div>,
  );
  return {
    webRoot: screen.getByTestId('web'),
    emailRoot: screen.getByTestId('email'),
    web: screen.getByTestId('web').firstElementChild as HTMLElement,
    email: screen.getByTestId('email').firstElementChild as HTMLElement,
  };
}

/** One expectation per property, labelled, so a failure names the property instead of dumping two objects. */
export function expectSameStyles(web: Element, email: Element, props: StyleProp[]) {
  const w = getComputedStyle(web);
  const e = getComputedStyle(email);
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
