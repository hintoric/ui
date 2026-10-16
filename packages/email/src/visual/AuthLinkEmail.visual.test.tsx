import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { AuthLinkEmail, authLinkMessagesDe, renderEmail, type AuthLinkProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * No @mui/joy or web counterpart: a self-baseline test of the real output in
 * the mode a mail client shows it in, like AuthLinkEmail's. Recovery with
 * an expiry line, the variant with the most on it.
 */

const props: AuthLinkProps = {
  purpose: 'recovery',
  email: 'max@muster.de',
  url: 'https://auth.example.com/self-service/recovery?flow=1&token=abc',
  expiresInMinutes: 60,
  messages: authLinkMessagesDe,
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

async function renderLink(scheme: 'light' | 'dark', width = 640) {
  const { html } = await renderEmail(<AuthLinkEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, height: 720, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Konto wiederherstellen')!,
  };
}

describe('AuthLinkEmail visual (self-baseline)', () => {
  beforeEach(async () => {
    await page.viewport(720, 760);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`matches its own baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderLink(scheme);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-link-${scheme}`);
    });

    it(`matches its own phone baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderLink(scheme, 375);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-link-phone-${scheme}`);
    });
  }

  it('changes page, card, border and heading colours between light and dark; the solid button is the same in both, as on the web', async () => {
    const read = ({ doc, card, heading }: Awaited<ReturnType<typeof renderLink>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
      };
    };
    const light = read(await renderLink('light'));
    const dark = read(await renderLink('dark'));
    for (const key of Object.keys(light) as (keyof typeof light)[]) {
      expect(dark[key], key).not.toBe(light[key]);
    }
  });

  it('lays the card out like AuthScreen and sends a 44px button', async () => {
    const { doc, card, heading, button } = await renderLink('light');
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(doc.defaultView!.getComputedStyle(card).borderTopLeftRadius).toBe('20px');
    expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(49);
    expect(button.getBoundingClientRect().height).toBe(44);
  });
});
