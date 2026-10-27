import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { CookieConsent } from './CookieConsent';
import type { CookieConsentProps } from './types';
import { CookieConsentProvider, useCookieConsent } from '../../theme/CookieConsentProvider';
import type { ConsentCategory, CookieConsentProviderProps } from '../../theme/CookieConsentProvider';
import { formatConsentCookie, parseConsentCookie, readCookieValue } from '../../theme/consentCookie';

vi.mock('../../theme/reloadPage', () => ({ reloadPage: vi.fn() }));

const categories: ConsentCategory[] = [
  { id: 'necessary', label: 'Necessary', required: true },
  { id: 'statistics', label: 'Statistics', description: 'Measure how the site is used.' },
  { id: 'marketing', label: 'Marketing' },
];

function OpenSettings() {
  const { openSettings } = useCookieConsent();
  return (
    <button type="button" onClick={openSettings}>
      Cookie settings
    </button>
  );
}

function renderConsent(props: CookieConsentProps = {}, provider: Partial<CookieConsentProviderProps> = {}) {
  return render(
    <CookieConsentProvider categories={categories} version="1" {...provider}>
      <CookieConsent {...props} />
      <OpenSettings />
    </CookieConsentProvider>,
  );
}

function setCookie(choices: Record<string, boolean>) {
  document.cookie = formatConsentCookie(
    { version: '1', choices, decidedAt: new Date().toISOString() },
    { name: 'hintoric_consent', maxAgeDays: 180, secure: false },
  );
}

function storedChoices() {
  return parseConsentCookie(readCookieValue(document.cookie, 'hintoric_consent'), { version: '1' })?.choices;
}

const banner = () => screen.getByRole('region', { name: 'Allow cookies?' });
const queryBanner = () => screen.queryByRole('region', { name: 'Allow cookies?' });
const dialog = () => screen.getByRole('dialog', { name: 'Choose cookies' });

afterEach(() => {
  document.cookie = 'hintoric_consent=; Max-Age=0; Path=/';
});

describe('CookieConsent banner', () => {
  it('shows the banner while undecided', () => {
    renderConsent();

    expect(within(banner()).getByText('Some cookies are needed for the site. All others are only set with your consent.')).toBeInTheDocument();
  });

  it('orders the banner buttons reject, allow, customize in the DOM', () => {
    renderConsent();

    const names = within(banner())
      .getAllByRole('button')
      .map((button) => button.textContent);

    expect(names).toEqual(['Reject', 'Allow', 'Choose individually']);
  });

  it('has no way to dismiss the banner without deciding', async () => {
    renderConsent();

    expect(within(banner()).queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    await userEvent.setup().keyboard('{Escape}');

    expect(banner()).toBeInTheDocument();
  });

  it('does not take focus', () => {
    renderConsent();

    expect(document.activeElement).toBe(document.body);
    expect(document.querySelector('[aria-modal]')).toBeNull();
  });

  it('Allow stores everything and hides the banner', async () => {
    renderConsent();

    await userEvent.setup().click(within(banner()).getByRole('button', { name: 'Allow' }));

    expect(storedChoices()).toEqual({ statistics: true, marketing: true });
    expect(queryBanner()).not.toBeInTheDocument();
  });

  it('Reject stores nothing and hides the banner', async () => {
    renderConsent();

    await userEvent.setup().click(within(banner()).getByRole('button', { name: 'Reject' }));

    expect(storedChoices()).toEqual({ statistics: false, marketing: false });
    expect(queryBanner()).not.toBeInTheDocument();
  });

  it('links the privacy policy only when given', async () => {
    const { unmount } = renderConsent();
    expect(within(banner()).queryByRole('link')).not.toBeInTheDocument();
    unmount();

    renderConsent({ privacyHref: '/datenschutz' });
    expect(within(banner()).getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/datenschutz');
    await userEvent.setup().click(within(banner()).getByRole('button', { name: 'Choose individually' }));

    expect(within(dialog()).getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/datenschutz');
  });

  it('overrides single labels and keeps the rest', () => {
    renderConsent({ labels: { reject: 'Ablehnen' } });

    expect(within(banner()).getByRole('button', { name: 'Ablehnen' })).toBeInTheDocument();
    expect(within(banner()).getByRole('button', { name: 'Allow' })).toBeInTheDocument();
  });
});

describe('CookieConsent settings', () => {
  async function openFromBanner() {
    const user = userEvent.setup();
    renderConsent();
    await user.click(within(banner()).getByRole('button', { name: 'Choose individually' }));
    return user;
  }

  it('opens the settings instead of the banner', async () => {
    await openFromBanner();

    expect(dialog()).toBeInTheDocument();
    expect(queryBanner()).not.toBeInTheDocument();
  });

  it('shows the required category on, locked and always on', async () => {
    await openFromBanner();

    const necessary = within(dialog()).getByRole('switch', { name: 'Necessary' });
    expect(necessary).toBeChecked();
    expect(necessary).toHaveAttribute('data-disabled');
    expect(within(dialog()).getByText('Always on')).toBeInTheDocument();
    expect(within(dialog()).getByRole('switch', { name: 'Statistics' })).not.toBeChecked();
    expect(within(dialog()).getByRole('switch', { name: 'Marketing' })).not.toBeChecked();
    expect(within(dialog()).getByRole('switch', { name: 'Statistics' })).toHaveAccessibleDescription(
      'Measure how the site is used.',
    );
  });

  it('saves exactly the switched selection', async () => {
    const user = await openFromBanner();

    await user.click(within(dialog()).getByRole('switch', { name: 'Statistics' }));
    await user.click(within(dialog()).getByRole('button', { name: 'Save selection' }));

    expect(storedChoices()).toEqual({ statistics: true, marketing: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('allows everything from the dialog', async () => {
    const user = await openFromBanner();

    await user.click(within(dialog()).getByRole('button', { name: 'Allow all' }));

    expect(storedChoices()).toEqual({ statistics: true, marketing: true });
  });

  it('closes the dialog with Escape without saving', async () => {
    const user = await openFromBanner();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(storedChoices()).toBeUndefined();
    expect(banner()).toBeInTheDocument();
  });

  it('closes the dialog with its close button without saving', async () => {
    const user = await openFromBanner();

    await user.click(within(dialog()).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(storedChoices()).toBeUndefined();
    expect(banner()).toBeInTheDocument();
  });

  it('edits an existing choice', async () => {
    setCookie({ statistics: true, marketing: false });
    const user = userEvent.setup();
    renderConsent();
    expect(queryBanner()).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cookie settings' }));
    expect(within(dialog()).getByRole('switch', { name: 'Statistics' })).toBeChecked();
    await user.keyboard('{Escape}');

    expect(queryBanner()).not.toBeInTheDocument();
    expect(storedChoices()).toEqual({ statistics: true, marketing: false });
  });
});

describe('CookieConsent server rendering', () => {
  function html(initialCookie?: string | null) {
    const props = initialCookie === undefined ? {} : { initialCookie };
    return renderToString(
      <CookieConsentProvider categories={categories} version="1" {...props}>
        <CookieConsent />
      </CookieConsentProvider>,
    );
  }

  it('renders the banner on the server only when the server looked', () => {
    expect(html(null)).toContain('Allow cookies?');
    expect(html()).not.toContain('Allow cookies?');
  });
});
