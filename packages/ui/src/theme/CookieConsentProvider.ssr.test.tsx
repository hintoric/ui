import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { CookieConsentProvider, useCookieConsentState } from './CookieConsentProvider';
import type { ConsentCategory } from './CookieConsentProvider';
import { formatConsentCookie, readCookieValue } from './consentCookie';

const categories: ConsentCategory[] = [
  { id: 'necessary', label: 'Necessary', required: true },
  { id: 'statistics', label: 'Statistics' },
];

function cookieFor(version: string) {
  return formatConsentCookie(
    { version, choices: { statistics: true }, decidedAt: new Date().toISOString() },
    { name: 'hintoric_consent', maxAgeDays: 180, secure: false },
  );
}

function valueOf(cookie: string) {
  return readCookieValue(cookie.split(';')[0], 'hintoric_consent');
}

function Probe() {
  const { known, consent } = useCookieConsentState();
  return <span data-testid="probe">{known ? (consent ? 'decided' : 'undecided') : 'unknown'}</span>;
}

function app(initialCookie?: string | null) {
  const props = initialCookie === undefined ? {} : { initialCookie };
  return (
    <CookieConsentProvider categories={categories} version="1" {...props}>
      <Probe />
    </CookieConsentProvider>
  );
}

interface Row {
  name: string;
  /** What the request carried, as the browser will have it too. */
  browserCookie?: string;
  initialCookie?: string | null;
  server: string;
}

const valid = cookieFor('1');
const old = cookieFor('0');

const rows: Row[] = [
  { name: 'the server did not look', server: 'unknown' },
  { name: 'the request had no cookie', initialCookie: null, server: 'undecided' },
  { name: 'the request had a valid choice', browserCookie: valid, initialCookie: valueOf(valid), server: 'decided' },
  { name: 'the request had a choice from another version', browserCookie: old, initialCookie: valueOf(old), server: 'undecided' },
];

let root: Root | undefined;

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  document.cookie = 'hintoric_consent=; Max-Age=0; Path=/';
});

async function hydrate(html: string, element: React.ReactElement) {
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);
  const onRecoverableError = vi.fn();
  await act(async () => {
    root = hydrateRoot(container, element, { onRecoverableError });
  });
  return { container, onRecoverableError };
}

describe('CookieConsentProvider server rendering', () => {
  it.each(rows)('renders $server when $name', ({ initialCookie, server }) => {
    expect(renderToString(app(initialCookie))).toContain(`>${server}<`);
  });

  it.each(rows)('hydrates without a mismatch when $name', async ({ browserCookie, initialCookie }) => {
    if (browserCookie) document.cookie = browserCookie;
    const html = renderToString(app(initialCookie));

    const { onRecoverableError } = await hydrate(html, app(initialCookie));

    expect(onRecoverableError).not.toHaveBeenCalled();
  });

  it('shows the undecided state after hydrating when the server did not look', async () => {
    const html = renderToString(app());

    const { container } = await hydrate(html, app());

    expect(container.textContent).toBe('undecided');
  });
});
