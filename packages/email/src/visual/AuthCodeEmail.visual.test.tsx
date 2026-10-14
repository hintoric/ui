import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { AuthCodeEmail, authCodeMessagesDe, renderEmail, type AuthCodeProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * The template has no @mui/joy or web counterpart, so this is a self-baseline
 * test like SecurityActivityAlertEmail's — of the real output, written into an
 * iframe so its doctype puts the frame in the (limited-quirks) mode a mail
 * client shows it in. Its parts carry their own parity tests.
 *
 * The richest variant: verification, which is the one with a button, plus the
 * expiry line and the address.
 */

const props: AuthCodeProps = {
  purpose: 'verification',
  code: '482915',
  email: 'max@muster.de',
  url: 'https://auth.example.com/self-service/verification?flow=1&code=482915',
  expiresInMinutes: 60,
  messages: authCodeMessagesDe,
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

/** Above 600px the desktop layout; at 600 and below the phone sheet. */
async function renderCode(scheme: 'light' | 'dark', width = 640) {
  const { html } = await renderEmail(<AuthCodeEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, height: 860, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  const code = doc.querySelector('[data-auth-code]') as HTMLElement;
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    code,
    codeLine: code.parentElement as HTMLElement,
    codeBox: code.closest('table') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Adresse bestätigen')!,
  };
}

describe('AuthCodeEmail visual (self-baseline)', () => {
  // The default test viewport is narrower than the 640px iframe, which would
  // clip the element screenshot. Restored afterwards for the other files.
  beforeEach(async () => {
    await page.viewport(720, 900);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`matches its own baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderCode(scheme);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-code-${scheme}`);
    });

    it(`matches its own phone baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderCode(scheme, 375);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-code-phone-${scheme}`);
    });
  }

  it('changes page, card, border, heading, code and code-box colours between light and dark', async () => {
    const read = ({ doc, card, heading, code, codeBox }: Awaited<ReturnType<typeof renderCode>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
        code: view.getComputedStyle(code).color,
        box: view.getComputedStyle(codeBox).backgroundColor,
        boxBorder: view.getComputedStyle(codeBox).borderTopColor,
      };
    };
    const light = read(await renderCode('light'));
    const dark = read(await renderCode('dark'));
    for (const key of Object.keys(light) as (keyof typeof light)[]) {
      expect(dark[key], key).not.toBe(light[key]);
    }
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`sets the code apart from the card it sits on in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { doc, card, codeBox } = await renderCode(scheme);
      const view = doc.defaultView!;
      // A box the colour of its surroundings needs its border to be seen.
      const sameFill = view.getComputedStyle(codeBox).backgroundColor === view.getComputedStyle(card).backgroundColor;
      if (sameFill) expect(view.getComputedStyle(codeBox).borderTopWidth).toBe('1px');
      expect(view.getComputedStyle(codeBox).borderTopColor).not.toBe(view.getComputedStyle(codeBox).backgroundColor);
    });
  }

  it('shows the code in one monospace line, large and centred in its box', async () => {
    const { doc, code, codeLine, codeBox } = await renderCode('light');
    const style = doc.defaultView!.getComputedStyle(codeLine);
    expect(style.fontFamily).toContain('monospace');
    expect(style.fontWeight).toBe('700');
    expect(parseFloat(style.fontSize)).toBeGreaterThanOrEqual(28);
    // One line: the text is no taller than its line box.
    expect(code.getBoundingClientRect().height).toBeLessThanOrEqual(parseFloat(style.lineHeight) + 1);
    // Centred within a pixel, the trailing letter spacing compensated.
    const box = codeBox.getBoundingClientRect();
    const range = doc.createRange();
    range.selectNodeContents(code);
    const glyphs = range.getBoundingClientRect();
    const spacing = parseFloat(style.letterSpacing);
    const left = glyphs.left - box.left;
    const right = box.right - (glyphs.right - spacing);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  });

  it('lays the card out like AuthScreen: 440px, 20px radius, 48px inset', async () => {
    const { doc, card, heading } = await renderCode('light');
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(doc.defaultView!.getComputedStyle(card).borderTopLeftRadius).toBe('20px');
    expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(49);
  });

  it('sends a 44px button — Button lg — in the mode the mail is shown in', async () => {
    const { doc, button } = await renderCode('light');
    expect(doc.doctype?.publicId).toBe('-//W3C//DTD XHTML 1.0 Transitional//EN');
    expect(button.getBoundingClientRect().height).toBe(44);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`fills a 375px phone with a 24px inset, the code still on one line, in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { doc, card, heading, code, codeLine } = await renderCode(scheme, 375);
      const view = doc.defaultView!;
      expect(card.getBoundingClientRect().width).toBe(375);
      expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(24);
      expect(code.getBoundingClientRect().height).toBeLessThanOrEqual(parseFloat(view.getComputedStyle(codeLine).lineHeight) + 1);
    });
  }
});
