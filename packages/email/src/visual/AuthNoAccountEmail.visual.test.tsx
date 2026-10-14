import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { AuthNoAccountEmail, authNoAccountMessagesDe, renderEmail, type AuthNoAccountProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * No @mui/joy or web counterpart: a self-baseline test of the real output in
 * the mode a mail client shows it in, like SecurityActivityAlertEmail's. With
 * the registration button, the variant with the most on it.
 */

const props: AuthNoAccountProps = {
  purpose: 'recovery',
  email: 'max@muster.de',
  registrationUrl: 'https://app.example.com/auth/registration',
  messages: authNoAccountMessagesDe,
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

async function renderNoAccount(scheme: 'light' | 'dark', width = 640) {
  const { html } = await renderEmail(<AuthNoAccountEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, height: 720, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Konto anlegen')!,
    alert: doc.querySelector('table.hx-soft-warning') as HTMLElement,
  };
}

describe('AuthNoAccountEmail visual (self-baseline)', () => {
  beforeEach(async () => {
    await page.viewport(720, 760);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`matches its own baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderNoAccount(scheme);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-no-account-${scheme}`);
    });

    it(`matches its own phone baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderNoAccount(scheme, 375);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`auth-no-account-phone-${scheme}`);
    });
  }

  it('changes page, card, border, heading, alert and button colours between light and dark', async () => {
    const read = ({ doc, card, heading, button, alert }: Awaited<ReturnType<typeof renderNoAccount>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
        button: view.getComputedStyle(button).color,
        alert: view.getComputedStyle(alert).backgroundColor,
        alertInk: view.getComputedStyle(alert).color,
      };
    };
    const light = read(await renderNoAccount('light'));
    const dark = read(await renderNoAccount('dark'));
    for (const key of Object.keys(light) as (keyof typeof light)[]) {
      expect(dark[key], key).not.toBe(light[key]);
    }
  });

  it('lays the card out like AuthScreen and sends a 44px button', async () => {
    const { doc, card, heading, button } = await renderNoAccount('light');
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(doc.defaultView!.getComputedStyle(card).borderTopLeftRadius).toBe('20px');
    expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(49);
    expect(button.getBoundingClientRect().height).toBe(44);
  });
});
