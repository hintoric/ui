import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { WaitlistWelcomeEmail, renderEmail, waitlistWelcomeMessagesDe, type WaitlistWelcomeProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * No @mui/joy or web counterpart, so a self-baseline test like
 * SecurityActivityAlertEmail's: the HTML renderEmail produces, written into an
 * iframe so its doctype puts the frame in the mode a mail client shows it in.
 * Its parts carry their own parity tests next to this file.
 */

const props: WaitlistWelcomeProps = {
  messages: waitlistWelcomeMessagesDe,
  websiteUrl: 'https://hintoric.com',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

async function renderWelcome(scheme: 'light' | 'dark', width = 640) {
  const { html } = await renderEmail(<WaitlistWelcomeEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Zu hintoric.com')!,
  };
}

describe('WaitlistWelcomeEmail visual (self-baseline)', () => {
  beforeEach(async () => {
    await page.viewport(720, 840);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`matches its own baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderWelcome(scheme);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`waitlist-welcome-${scheme}`);
    });

    it(`matches its own phone baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderWelcome(scheme, 375);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`waitlist-welcome-phone-${scheme}`);
    });
  }

  it('changes page, card, border and heading colours between light and dark', async () => {
    const read = ({ doc, card, heading }: Awaited<ReturnType<typeof renderWelcome>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
      };
    };
    const light = read(await renderWelcome('light'));
    const dark = read(await renderWelcome('dark'));
    expect(dark.page).not.toBe(light.page);
    expect(dark.card).not.toBe(light.card);
    expect(dark.border).not.toBe(light.border);
    expect(dark.ink).not.toBe(light.ink);
  });

  it('sends a 44px button in the mode the mail is shown in', async () => {
    const { doc, button } = await renderWelcome('light');
    expect(doc.doctype?.publicId).toBe('-//W3C//DTD XHTML 1.0 Transitional//EN');
    expect(button.getBoundingClientRect().height).toBe(44);
  });
});
