// @vitest-environment-options {"url": "http://app.example.com/"}
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { CookieConsentProvider, useCookieConsent } from './CookieConsentProvider';
import type { ConsentCategory } from './CookieConsentProvider';
import { formatConsentCookie, readCookieValues } from './consentCookie';

vi.mock('./reloadPage', () => ({ reloadPage: vi.fn() }));

// A host-only cookie and one with a Domain are two cookies under one name. An
// app that starts setting cookieDomain later, or two apps on one domain, end
// up with both, and the browser lists the older one first.

const categories: ConsentCategory[] = [
  { id: 'necessary', label: 'Necessary', required: true },
  { id: 'statistics', label: 'Statistics' },
];

const DAY = 24 * 60 * 60 * 1000;

function writeCookie(statistics: boolean, daysAgo: number, domain?: string) {
  document.cookie = formatConsentCookie(
    { version: '1', choices: { statistics }, decidedAt: new Date(Date.now() - daysAgo * DAY).toISOString() },
    { name: 'hintoric_consent', maxAgeDays: 180, secure: false, domain },
  );
}

function renderConsent(cookieDomain?: string) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CookieConsentProvider categories={categories} version="1" cookieDomain={cookieDomain}>
      {children}
    </CookieConsentProvider>
  );
  return renderHook(() => useCookieConsent(), { wrapper });
}

afterEach(() => {
  document.cookie = 'hintoric_consent=; Max-Age=0; Path=/';
  document.cookie = 'hintoric_consent=; Max-Age=0; Path=/; Domain=.example.com';
});

describe('CookieConsentProvider with two cookies of one name', () => {
  it('reads the newest decision', () => {
    writeCookie(true, 10);
    writeCookie(false, 0, '.example.com');
    expect(readCookieValues(document.cookie, 'hintoric_consent')).toHaveLength(2);

    const { result } = renderConsent();

    expect(result.current.allows('statistics')).toBe(false);
  });

  it('lets a withdrawal take effect over an older host-only cookie', () => {
    writeCookie(true, 10);
    const { result } = renderConsent('.example.com');

    act(() => result.current.rejectAll());

    expect(result.current.allows('statistics')).toBe(false);
    expect(readCookieValues(document.cookie, 'hintoric_consent')).toHaveLength(1);
  });
});
