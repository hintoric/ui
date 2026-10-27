import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieConsent } from '../components/CookieConsent';
import type { CookieConsentLabels } from '../components/CookieConsent';
import { Button } from '../components/Button';
import { CookieConsentProvider } from '../theme/CookieConsentProvider';
import type { ConsentCategory } from '../theme/CookieConsentProvider';
import { ReducedMotionProvider } from '../theme/ReducedMotionProvider';
import { COLOR_SCHEMES, setColorScheme, settleTransitions } from './helpers';

// CookieConsent has no @mui/joy counterpart. Like ConfirmationDialog it is a
// composition of parts that each carry full Joy-compared coverage — Card,
// Button, Link, Modal, ModalDialog, Sheet, Switch — so it is exempt from the
// parity comparison (CLAUDE.md), not from colour-scheme coverage. It compares
// against our own Button instead: what a composition gets wrong is what it
// passes through, and reject and allow must stay identical.

const labels: CookieConsentLabels = {
  bannerTitle: 'Cookies erlauben?',
  bannerText: 'Einige Cookies sind für die Seite nötig. Alle anderen werden nur mit deiner Zustimmung gesetzt.',
  reject: 'Ablehnen',
  accept: 'Erlauben',
  customize: 'Einzeln auswählen',
  settingsTitle: 'Cookies auswählen',
  settingsText: 'Deine Auswahl kannst du jederzeit ändern.',
  alwaysOn: 'Immer an',
  save: 'Auswahl speichern',
  acceptAll: 'Alle erlauben',
  privacy: 'Datenschutzerklärung',
  close: 'Schließen',
};

const categories: ConsentCategory[] = [
  { id: 'necessary', label: 'Notwendig', description: 'Halten dich angemeldet und die Seite sicher.', required: true },
  { id: 'statistics', label: 'Statistik', description: 'Messen, wie die Seite genutzt wird.' },
  { id: 'marketing', label: 'Werbung', description: 'Zeigen dir auf anderen Seiten passende Anzeigen.' },
];

const DESKTOP = { width: 1280, height: 800 } as const;
const PHONE = { width: 375, height: 812 } as const;

const STYLE_PROPERTIES = [
  'backgroundColor',
  'color',
  'borderColor',
  'borderRadius',
  'minHeight',
  'fontSize',
  'fontWeight',
  'lineHeight',
] as const;

function styleOf(element: Element) {
  const style = getComputedStyle(element);
  return Object.fromEntries(STYLE_PROPERTIES.map((property) => [property, style[property]]));
}

async function renderBanner(viewport: { width: number; height: number }, reducedMotion?: boolean) {
  await page.viewport(viewport.width, viewport.height);
  const consent = (
    <CookieConsentProvider categories={categories} version="1">
      <CookieConsent labels={labels} privacyHref="/datenschutz" />
    </CookieConsentProvider>
  );
  render(reducedMotion === undefined ? consent : <ReducedMotionProvider reducedMotion={reducedMotion}>{consent}</ReducedMotionProvider>);
  // Two settles: the entrance animation outlasts one transition.
  await settleTransitions();
  await settleTransitions();
}

const banner = () => screen.getByRole('region', { name: 'Cookies erlauben?' });
const button = (name: string) => within(banner()).getByRole('button', { name });
const rect = (element: Element) => element.getBoundingClientRect();

async function openSettings() {
  const user = userEvent.setup();
  await user.click(button('Einzeln auswählen'));
  await user.click(within(screen.getByRole('dialog')).getByRole('switch', { name: 'Statistik' }));
  await settleTransitions();
}

afterEach(() => {
  document.cookie = 'hintoric_consent=; Max-Age=0; Path=/';
});

describe('CookieConsent visual (self-baseline)', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`banner on a desktop matches its baseline in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderBanner(DESKTOP);

      await expect(page.getByRole('region', { name: 'Cookies erlauben?' })).toMatchScreenshot(
        `cookie-consent-banner-desktop-${scheme}`,
      );
    });

    it(`banner on a phone matches its baseline in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderBanner(PHONE);

      await expect(page.getByRole('region', { name: 'Cookies erlauben?' })).toMatchScreenshot(
        `cookie-consent-banner-phone-${scheme}`,
      );
    });

    it(`settings dialog matches its baseline in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderBanner(DESKTOP);
      await openSettings();

      await expect(page.getByRole('dialog')).toMatchScreenshot(`cookie-consent-settings-${scheme}`);
    });
  }
});

describe('CookieConsent colour schemes', () => {
  it('the banner changes with the scheme', async () => {
    await setColorScheme('light');
    await renderBanner(DESKTOP);
    const light = getComputedStyle(banner());
    const lightValues = [light.backgroundColor, light.color, light.borderColor];

    await setColorScheme('dark');
    const dark = getComputedStyle(banner());

    expect(dark.backgroundColor).not.toBe(lightValues[0]);
    expect(dark.color).not.toBe(lightValues[1]);
    expect(dark.borderColor).not.toBe(lightValues[2]);
  });
});

describe('CookieConsent buttons', () => {
  for (const scheme of COLOR_SCHEMES) {
    it(`reject and allow look the same in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderBanner(DESKTOP);
      const reject = button('Ablehnen');
      const allow = button('Erlauben');
      const rejectStyle = styleOf(reject);
      const allowStyle = styleOf(allow);
      const widths = [rect(reject).width, rect(allow).width];
      render(
        <Button data-testid="reference" variant="solid" color="primary" size="lg">
          Referenz
        </Button>,
      );
      await settleTransitions();

      expect(allowStyle).toEqual(rejectStyle);
      expect(rejectStyle).toEqual(styleOf(screen.getByTestId('reference')));
      expect(widths[1]).toBe(widths[0]);
    });

    it(`the dialog buttons match their references in ${scheme}`, async () => {
      await setColorScheme(scheme);
      await renderBanner(DESKTOP);
      await openSettings();
      const dialog = screen.getByRole('dialog');
      const save = styleOf(within(dialog).getByRole('button', { name: 'Auswahl speichern' }));
      const acceptAll = styleOf(within(dialog).getByRole('button', { name: 'Alle erlauben' }));
      render(
        <>
          <Button data-testid="reference-outlined" variant="outlined" color="neutral" size="lg">
            Referenz
          </Button>
          <Button data-testid="reference-solid" variant="solid" color="primary" size="lg">
            Referenz
          </Button>
        </>,
      );
      await settleTransitions();

      expect(save).toEqual(styleOf(screen.getByTestId('reference-outlined')));
      expect(acceptAll).toEqual(styleOf(screen.getByTestId('reference-solid')));
    });
  }
});

describe('CookieConsent layout', () => {
  it('sits in the bottom left corner on a desktop, reject left of allow', async () => {
    await renderBanner(DESKTOP);
    const card = rect(banner());
    const reject = rect(button('Ablehnen'));
    const allow = rect(button('Erlauben'));

    expect(card.left).toBe(24);
    expect(card.bottom).toBe(DESKTOP.height - 24);
    expect(card.width).toBeLessThanOrEqual(440);
    expect(reject.left).toBeLessThan(allow.left);
    expect(reject.top).toBe(allow.top);
  });

  it('spans the bottom of a phone, allow on top', async () => {
    await renderBanner(PHONE);
    const card = rect(banner());

    expect(card.width).toBe(PHONE.width);
    expect(card.bottom).toBe(PHONE.height);
    expect(rect(button('Erlauben')).top).toBeLessThan(rect(button('Ablehnen')).top);
    expect(rect(button('Ablehnen')).top).toBeLessThan(rect(button('Einzeln auswählen')).top);
  });

  // A phone held sideways, and 320 CSS px at 400 % zoom (WCAG 1.4.10).
  for (const short of [{ width: 568, height: 320 }, { width: 320, height: 256 }]) {
    it(`keeps the banner on a ${short.width}×${short.height} screen and scrolls it`, async () => {
      await renderBanner(short);
      const card = rect(banner());

      expect(card.top).toBeGreaterThanOrEqual(0);
      expect(card.bottom).toBeLessThanOrEqual(short.height);
      expect(getComputedStyle(banner()).overflowY).toBe('auto');
    });

    it(`keeps the dialog on a ${short.width}×${short.height} screen and scrolls it`, async () => {
      await renderBanner(short);
      await openSettings();
      const dialog = screen.getByRole('dialog');
      const box = rect(dialog);

      expect(box.top).toBeGreaterThanOrEqual(0);
      expect(box.bottom).toBeLessThanOrEqual(short.height);
      expect(getComputedStyle(dialog).overflowY).toBe('auto');
    });
  }

  it('does not animate with reduced motion', async () => {
    await renderBanner(DESKTOP, true);

    expect(getComputedStyle(banner()).animationName).toBe('none');
  });
});
