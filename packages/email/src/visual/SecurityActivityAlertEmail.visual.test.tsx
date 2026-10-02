import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { SecurityActivityAlertEmail, renderEmail, securityActivityAlertMessagesDe, type SecurityActivityAlertProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * The template has no @mui/joy or web counterpart, so this is a self-baseline
 * test like RelativeTime's — but of the real output: the HTML renderEmail
 * produces, written into an iframe so its doctype puts the frame in the same
 * (limited-quirks) mode a mail client shows it in. Its parts carry their own
 * parity tests against the web components, next to this file.
 */

const props: SecurityActivityAlertProps = {
  activity: { title: 'Bankverbindung geändert', actorName: 'Erika Mustermann', occurredAt: new Date('2026-09-28T17:31:00Z') },
  target: { type: 'workspace', workspaceName: 'Muster GmbH' },
  reviewUrl: 'https://app.example.com/activity/4711',
  activityLogUrl: 'https://app.example.com/activity',
  messages: securityActivityAlertMessagesDe,
  timeZone: 'Europe/Berlin',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

/**
 * `width` above 600px is the desktop layout; at 600 and below the stylesheet's
 * phone rule turns the card into a full-width sheet, as AuthScreen does.
 */
async function renderAlert(scheme: 'light' | 'dark', width = 640) {
  const { html } = await renderEmail(<SecurityActivityAlertEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === 'Aktivität prüfen')!,
  };
}

describe('SecurityActivityAlertEmail visual (self-baseline)', () => {
  // The default test viewport is narrower than the 640px iframe, which would
  // clip the element screenshot. Restored afterwards for the other files.
  beforeEach(async () => {
    await page.viewport(720, 840);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`matches its own baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderAlert(scheme);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`security-activity-alert-${scheme}`);
    });

    it(`matches its own phone baseline screenshot in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { testId } = await renderAlert(scheme, 375);
      await expect(page.getByTestId(testId)).toMatchScreenshot(`security-activity-alert-phone-${scheme}`);
    });
  }

  it('changes page, card, border and heading colours between light and dark', async () => {
    const read = ({ doc, card, heading }: Awaited<ReturnType<typeof renderAlert>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
      };
    };
    const light = read(await renderAlert('light'));
    const dark = read(await renderAlert('dark'));
    expect(dark.page).not.toBe(light.page);
    expect(dark.card).not.toBe(light.card);
    expect(dark.border).not.toBe(light.border);
    expect(dark.ink).not.toBe(light.ink);
  });

  it('lays the card out like AuthScreen: 440px, 20px radius, 48px inset', async () => {
    const { doc, card, heading } = await renderAlert('light');
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(doc.defaultView!.getComputedStyle(card).borderTopLeftRadius).toBe('20px');
    // The content's actual inset, not one element's `padding`: 1px border + 48.
    expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(49);
  });

  it('sends a 44px button — Button lg — in the mode the mail is shown in', async () => {
    const { doc, button } = await renderAlert('light');
    // limited-quirks: react-email's XHTML 1.0 Transitional doctype.
    expect(doc.doctype?.publicId).toBe('-//W3C//DTD XHTML 1.0 Transitional//EN');
    expect(button.getBoundingClientRect().height).toBe(44);
  });

  for (const scheme of COLOR_SCHEMES) {
    it(`fills a 375px phone with a 24px inset and the card's colour around it in ${scheme}`, async () => {
      await setColorScheme(scheme);
      const { doc, card, heading } = await renderAlert(scheme, 375);
      const view = doc.defaultView!;
      expect(card.getBoundingClientRect().width).toBe(375);
      expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(24);
      expect(view.getComputedStyle(card).borderTopWidth).toBe('0px');
      expect(view.getComputedStyle(card).borderTopLeftRadius).toBe('0px');
      expect(view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor).toBe(view.getComputedStyle(card).backgroundColor);
    });
  }
});
