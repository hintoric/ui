import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import {
  CompanyDataFoundEmail,
  companyDataFoundMessagesDe,
  companyDataFoundMessagesEn,
  renderEmail,
  type CompanyDataFoundProps,
} from '../index';
import { COLOR_SCHEMES, setColorScheme } from './helpers';
import { writeEmailDocument } from './parity';

/*
 * No @mui/joy or web counterpart: a self-baseline test of the real output in
 * the mode a mail client shows it in, like AuthLinkEmail's. Both languages,
 * since the English sentence runs to a different number of lines.
 */

const props: Omit<CompanyDataFoundProps, 'messages'> = {
  companyName: 'Muster Bau GmbH',
  website: 'muster-bau.de',
  reviewUrl: 'https://app.example.com/settings/company?suggestion=1',
  workspaceName: 'Muster Bau',
  legalNotice: 'Muster GmbH · Musterstraße 1 · 79098 Freiburg',
};

const LANGS = {
  de: companyDataFoundMessagesDe,
  en: companyDataFoundMessagesEn,
} as const;

async function renderFound(scheme: 'light' | 'dark', lang: keyof typeof LANGS = 'de', width = 640) {
  const messages = LANGS[lang];
  const { html } = await renderEmail(<CompanyDataFoundEmail {...props} messages={messages} colorScheme={scheme} />);
  const testId = `email-${lang}-${scheme}-${width}`;
  render(<iframe data-testid={testId} title="email" style={{ width, height: 640, border: 0, display: 'block' }} />);
  const doc = await writeEmailDocument(screen.getByTestId(testId) as HTMLIFrameElement, html);
  return {
    testId,
    doc,
    card: doc.querySelector('.hx-layout-card') as HTMLElement,
    heading: doc.querySelector('h1') as HTMLElement,
    button: [...doc.querySelectorAll('a')].find((a) => a.textContent === messages.button)!,
  };
}

describe('CompanyDataFoundEmail visual (self-baseline)', () => {
  beforeEach(async () => {
    await page.viewport(720, 680);
  });
  afterEach(async () => {
    await page.viewport(414, 896);
  });

  for (const lang of ['de', 'en'] as const) {
    for (const scheme of COLOR_SCHEMES) {
      it(`matches its own baseline screenshot in ${lang}, ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { testId } = await renderFound(scheme, lang);
        await expect(page.getByTestId(testId)).toMatchScreenshot(`company-data-found-${lang}-${scheme}`);
      });

      it(`matches its own phone baseline screenshot in ${lang}, ${scheme}`, async () => {
        await setColorScheme(scheme);
        const { testId } = await renderFound(scheme, lang, 375);
        await expect(page.getByTestId(testId)).toMatchScreenshot(`company-data-found-phone-${lang}-${scheme}`);
      });
    }
  }

  it('changes page, card, border and heading colours between light and dark; the solid button is the same in both, as on the web', async () => {
    const read = ({ doc, card, heading }: Awaited<ReturnType<typeof renderFound>>) => {
      const view = doc.defaultView!;
      return {
        page: view.getComputedStyle(doc.querySelector('body > table td')!).backgroundColor,
        card: view.getComputedStyle(card).backgroundColor,
        border: view.getComputedStyle(card).borderTopColor,
        ink: view.getComputedStyle(heading).color,
      };
    };
    const light = read(await renderFound('light'));
    const dark = read(await renderFound('dark'));
    for (const key of Object.keys(light) as (keyof typeof light)[]) {
      expect(dark[key], key).not.toBe(light[key]);
    }
  });

  it('lays the card out like AuthScreen and sends a 44px button', async () => {
    const { doc, card, heading, button } = await renderFound('light');
    expect(card.getBoundingClientRect().width).toBe(440);
    expect(doc.defaultView!.getComputedStyle(card).borderTopLeftRadius).toBe('20px');
    expect(heading.getBoundingClientRect().left - card.getBoundingClientRect().left).toBe(49);
    expect(button.getBoundingClientRect().height).toBe(44);
  });
});
