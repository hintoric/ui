import { describe, expect, it } from 'vitest';
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_DAYS,
  formatConsentCookie,
  parseConsentCookie,
  readCookieValue,
} from './consentCookie';
import type { ConsentState } from './consentCookie';

const DAY = 24 * 60 * 60 * 1000;
const now = new Date('2026-10-27T12:00:00Z');

const state: ConsentState = {
  version: '1',
  choices: { statistics: true, marketing: false },
  decidedAt: '2026-10-01T12:00:00.000Z',
};

const cookieOptions = { name: CONSENT_COOKIE_NAME, maxAgeDays: CONSENT_MAX_AGE_DAYS, secure: false };

function encode(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value));
}

function daysFromNow(days: number): string {
  return new Date(now.getTime() + days * DAY).toISOString();
}

describe('consent cookie', () => {
  it('round-trips a formatted cookie', () => {
    const pair = formatConsentCookie(state, cookieOptions).split(';')[0];

    const value = readCookieValue(pair, 'hintoric_consent');

    expect(parseConsentCookie(value, { version: '1', now })).toEqual(state);
  });

  it('formats the attributes', () => {
    const plain = formatConsentCookie(state, cookieOptions);
    const secure = formatConsentCookie(state, { ...cookieOptions, secure: true });
    const scoped = formatConsentCookie(state, { ...cookieOptions, domain: '.hintoric.com' });

    expect(plain).toContain('Max-Age=15552000');
    expect(plain).toContain('Path=/');
    expect(plain).toContain('SameSite=Lax');
    expect(plain).not.toContain('Secure');
    expect(plain).not.toContain('Domain=');
    expect(secure).toContain('Secure');
    expect(scoped).toContain('Domain=.hintoric.com');
    for (const cookie of [plain, secure, scoped]) expect(cookie).not.toContain('HttpOnly');
  });

  it.each([
    ['nothing', undefined],
    ['null', null],
    ['an empty string', ''],
    ['text that is not JSON', 'kein json'],
    ['a JSON array', encode([])],
    ['a value without decidedAt', encode({ version: '1', choices: {} })],
    ['another version', encode({ ...state, version: '2' })],
    ['a choice that is a string', encode({ ...state, choices: { statistics: 'true' } })],
    ['a choice that is a number', encode({ ...state, choices: { statistics: 1 } })],
    ['a decidedAt that is not a date', encode({ ...state, decidedAt: 'gestern' })],
    ['a decision older than its lifetime', encode({ ...state, decidedAt: daysFromNow(-181) })],
    ['a decision more than a day in the future', encode({ ...state, decidedAt: daysFromNow(2) })],
  ])('returns null for %s', (_, value) => {
    expect(parseConsentCookie(value, { version: '1', now })).toBeNull();
  });

  it('accepts a choice inside its lifetime', () => {
    const recent = { ...state, decidedAt: daysFromNow(-179) };

    expect(parseConsentCookie(encode(recent), { version: '1', now })).toEqual(recent);
  });

  it('honours a shorter maxAgeDays for cookies already written', () => {
    const value = encode({ ...state, decidedAt: daysFromNow(-31) });

    expect(parseConsentCookie(value, { version: '1', maxAgeDays: 30, now })).toBeNull();
  });

  it('keeps choice ids it does not know', () => {
    const stored = { ...state, choices: { gone: true } };

    expect(parseConsentCookie(encode(stored), { version: '1', now })).toEqual(stored);
  });

  it('reads only the exact cookie name', () => {
    expect(readCookieValue('a=1; hintoric_consent=x; b=2', 'hintoric_consent')).toBe('x');
    expect(readCookieValue('hintoric_consent_old=y; xhintoric_consent=z', 'hintoric_consent')).toBeUndefined();
    expect(readCookieValue('hintoric_consent=a=b', 'hintoric_consent')).toBe('a=b');
  });
});
