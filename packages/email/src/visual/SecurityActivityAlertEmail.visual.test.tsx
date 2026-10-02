import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { SecurityActivityAlertEmail, renderEmail, securityActivityAlertMessagesDe, type SecurityActivityAlertProps } from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';

/*
 * The template has no @mui/joy or web counterpart, so this is a self-baseline
 * test like RelativeTime's — but of the real output: the HTML renderEmail
 * produces, loaded into an iframe, exactly as a mail client receives it. Its
 * parts carry their own parity tests against the web components, next to
 * this file.
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

// Wider than 600px on purpose: at 600 and below the stylesheet's phone rule
// takes the card's border, radius and padding away, as AuthScreen does.
async function renderAlert(scheme: 'light' | 'dark') {
  const { html } = await renderEmail(<SecurityActivityAlertEmail {...props} colorScheme={scheme} />);
  const testId = `email-${scheme}`;
  render(<iframe data-testid={testId} title="email" srcDoc={html} style={{ width: 640, height: 720, border: 0 }} />);
  const frame = screen.getByTestId(testId) as HTMLIFrameElement;
  await new Promise<void>((resolve) => {
    if (frame.contentDocument?.readyState === 'complete' && frame.contentDocument.body.childElementCount) resolve();
    else frame.addEventListener('load', () => resolve(), { once: true });
  });
  const doc = frame.contentDocument!;
  return { doc, card: doc.querySelector('.hx-layout-card') as HTMLElement, heading: doc.querySelector('h1') as HTMLElement };
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
      await renderAlert(scheme);
      await expect(page.getByTestId(`email-${scheme}`)).toMatchScreenshot(`security-activity-alert-${scheme}`);
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

  it('lays the card out like AuthScreen: 440px, 20px radius, 48px padding', async () => {
    const { doc, card, heading } = await renderAlert('light');
    const style = doc.defaultView!.getComputedStyle(card);
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(style.borderTopLeftRadius).toBe('20px');
    // Measured as the content's actual inset rather than read off one
    // element's `padding`: react-email 6's Container carries the style onto an
    // inner cell, and which element holds it is its business. 1px border + 48.
    const inset = heading.getBoundingClientRect().left - card.getBoundingClientRect().left;
    expect(inset).toBe(49);
  });
});
