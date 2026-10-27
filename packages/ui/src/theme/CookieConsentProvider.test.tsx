import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ConsentGate,
  CookieConsentProvider,
  useConsent,
  useCookieConsent,
} from './CookieConsentProvider';
import type { ConsentCategory, CookieConsentProviderProps } from './CookieConsentProvider';
import { formatConsentCookie, parseConsentCookie, readCookieValue } from './consentCookie';
import { reloadPage } from './reloadPage';

vi.mock('./reloadPage', () => ({ reloadPage: vi.fn() }));

const categories: ConsentCategory[] = [
  { id: 'necessary', label: 'Necessary', required: true },
  { id: 'statistics', label: 'Statistics' },
  { id: 'marketing', label: 'Marketing' },
];

function setCookie(choices: Record<string, boolean>, version = '1', name = 'hintoric_consent') {
  document.cookie = formatConsentCookie(
    { version, choices, decidedAt: new Date().toISOString() },
    { name, maxAgeDays: 180, secure: false },
  );
}

function storedChoices(name = 'hintoric_consent') {
  return parseConsentCookie(readCookieValue(document.cookie, name), { version: '1' })?.choices;
}

function renderConsent(props: Partial<CookieConsentProviderProps> = {}) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CookieConsentProvider categories={categories} version="1" {...props}>
      {children}
    </CookieConsentProvider>
  );
  return renderHook(() => useCookieConsent(), { wrapper });
}

beforeEach(() => {
  vi.mocked(reloadPage).mockReset();
});

afterEach(() => {
  for (const name of ['hintoric_consent', 'site_consent']) document.cookie = `${name}=; Max-Age=0; Path=/`;
  vi.restoreAllMocks();
});

describe('CookieConsentProvider contract', () => {
  it('throws without a required category', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <CookieConsentProvider categories={[{ id: 'statistics', label: 'Statistics' }]} version="1">
          <p />
        </CookieConsentProvider>,
      ),
    ).toThrow('CookieConsentProvider: one category must be required');
  });

  it('throws on a duplicate id', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() =>
      render(
        <CookieConsentProvider categories={[...categories, { id: 'statistics', label: 'Again' }]} version="1">
          <p />
        </CookieConsentProvider>,
      ),
    ).toThrow('CookieConsentProvider: duplicate category id "statistics"');
  });

  it('useCookieConsent throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useCookieConsent())).toThrow(
      'useCookieConsent must be used within a CookieConsentProvider',
    );
  });
});

describe('CookieConsentProvider decisions', () => {
  it('starts undecided', () => {
    const { result } = renderConsent();

    expect(result.current.consent).toBeNull();
    expect(result.current.allows('necessary')).toBe(true);
    expect(result.current.allows('statistics')).toBe(false);
  });

  it('acceptAll stores every optional category as allowed', () => {
    const onChange = vi.fn();
    const { result } = renderConsent({ onChange });

    act(() => result.current.acceptAll());

    expect(document.cookie).toContain('hintoric_consent=');
    expect(result.current.consent?.choices).toEqual({ statistics: true, marketing: true });
    expect(result.current.consent?.version).toBe('1');
    expect(Number.isNaN(Date.parse(result.current.consent!.decidedAt))).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(result.current.consent, null);
  });

  it('rejectAll stores every optional category as refused', () => {
    const { result } = renderConsent();

    act(() => result.current.rejectAll());

    expect(storedChoices()).toEqual({ statistics: false, marketing: false });
  });

  it('save keeps only known categories and turns missing ones off', () => {
    const { result } = renderConsent();

    act(() => result.current.save({ statistics: true, gone: true }));

    expect(storedChoices()).toEqual({ statistics: true, marketing: false });
  });

  it('save closes the settings', () => {
    const { result } = renderConsent();

    act(() => result.current.openSettings());
    expect(result.current.settingsOpen).toBe(true);
    act(() => result.current.save({}));

    expect(result.current.settingsOpen).toBe(false);
  });

  it('closeSettings closes the settings without deciding', () => {
    const { result } = renderConsent();

    act(() => result.current.openSettings());
    act(() => result.current.closeSettings());

    expect(result.current.settingsOpen).toBe(false);
    expect(result.current.consent).toBeNull();
  });

  it('treats a cookie from another version as undecided', () => {
    setCookie({ statistics: true, marketing: true }, '0');

    const { result } = renderConsent();

    expect(result.current.consent).toBeNull();
  });

  it('turns a category off that was added after the decision', () => {
    setCookie({ statistics: true });

    const { result } = renderConsent();

    expect(result.current.consent).not.toBeNull();
    expect(result.current.allows('statistics')).toBe(true);
    expect(result.current.allows('marketing')).toBe(false);
  });

  it('uses cookieName for reading and writing', () => {
    setCookie({ statistics: true, marketing: false }, '1', 'site_consent');

    const { result } = renderConsent({ cookieName: 'site_consent' });
    expect(result.current.allows('statistics')).toBe(true);
    act(() => result.current.acceptAll());

    expect(storedChoices('site_consent')).toEqual({ statistics: true, marketing: true });
    expect(readCookieValue(document.cookie, 'hintoric_consent')).toBeUndefined();
  });

  it('passes cookieDomain and maxAgeDays to the cookie', () => {
    const written: string[] = [];
    vi.spyOn(Document.prototype, 'cookie', 'set').mockImplementation((value: string) => {
      written.push(value);
    });
    const { result } = renderConsent({ cookieDomain: '.hintoric.com', maxAgeDays: 30 });

    act(() => result.current.acceptAll());

    // First the host-only cookie of the same name is expired, then the choice is written.
    expect(written).toEqual(['hintoric_consent=; Max-Age=0; Path=/', expect.stringContaining('Domain=.hintoric.com')]);
    expect(written[1]).toContain('Max-Age=2592000');
  });
});

describe('CookieConsentProvider withdrawal', () => {
  it('reloads after a withdrawal, once onChange has run', () => {
    setCookie({ statistics: true, marketing: false });
    const calls: string[] = [];
    vi.mocked(reloadPage).mockImplementation(() => calls.push('reload'));
    const { result } = renderConsent({ onChange: () => calls.push('change') });

    act(() => result.current.save({ statistics: false }));

    expect(calls).toEqual(['change', 'reload']);
  });

  it('reloads a withdrawal made through a callback captured before the decision', () => {
    const onChange = vi.fn();
    const { result } = renderConsent({ onChange });
    const staleRejectAll = result.current.rejectAll;

    act(() => result.current.acceptAll());
    act(() => staleRejectAll());

    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ choices: { statistics: false, marketing: false } }),
      expect.objectContaining({ choices: { statistics: true, marketing: true } }),
    );
  });

  it('does not reload when nothing was withdrawn', () => {
    const { result } = renderConsent();

    act(() => result.current.acceptAll());

    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('does not reload when allowing after a refusal', () => {
    setCookie({ statistics: false, marketing: false });
    const { result } = renderConsent();

    act(() => result.current.acceptAll());

    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('does not reload a withdrawal with reloadOnWithdraw off', () => {
    setCookie({ statistics: true, marketing: true });
    const { result } = renderConsent({ reloadOnWithdraw: false });

    act(() => result.current.rejectAll());

    expect(reloadPage).not.toHaveBeenCalled();
  });

  it('keeps the choice when onChange throws', () => {
    setCookie({ statistics: true, marketing: false });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderConsent({
      onChange: () => {
        throw new Error('handler broke');
      },
    });

    act(() => result.current.rejectAll());

    expect(storedChoices()).toEqual({ statistics: false, marketing: false });
    expect(error).toHaveBeenCalled();
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});

describe('CookieConsentProvider reading', () => {
  it('warns once about an unknown category', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderConsent();

    expect(result.current.allows('statistcs')).toBe(false);
    expect(result.current.allows('statistcs')).toBe(false);

    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('useConsent and ConsentGate follow the decision', async () => {
    function Probe() {
      const statistics = useConsent('statistics');
      const { acceptAll } = useCookieConsent();
      return (
        <>
          <span data-testid="hook">{String(statistics)}</span>
          <ConsentGate category="statistics" fallback={<p>off</p>}>
            <p>on</p>
          </ConsentGate>
          <button type="button" onClick={acceptAll}>
            accept
          </button>
        </>
      );
    }
    render(
      <CookieConsentProvider categories={categories} version="1">
        <Probe />
      </CookieConsentProvider>,
    );
    expect(screen.getByTestId('hook')).toHaveTextContent('false');
    expect(screen.getByText('off')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'accept' }));

    expect(screen.getByTestId('hook')).toHaveTextContent('true');
    expect(screen.getByText('on')).toBeInTheDocument();
    expect(screen.queryByText('off')).not.toBeInTheDocument();
  });
});
