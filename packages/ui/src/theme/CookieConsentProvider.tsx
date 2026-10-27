'use client';
import * as React from 'react';
import {
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_DAYS,
  formatConsentCookie,
  parseConsentCookie,
  readCookieValues,
} from './consentCookie';
import type { ConsentState, ParseConsentCookieOptions } from './consentCookie';
import { reloadPage } from './reloadPage';

export type { ConsentState } from './consentCookie';

export interface ConsentCategory {
  /** Stable: it is stored in the cookie and passed to every `useConsent`. */
  id: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
}

export interface CookieConsentProviderProps {
  children: React.ReactNode;
  categories: readonly ConsentCategory[];
  /** Raise it to ask again. */
  version: string;
  cookieName?: string;
  cookieDomain?: string;
  maxAgeDays?: number;
  /**
   * For server rendering: the raw cookie value from the request header, or
   * `null` when the request had none. Leave it out when the server did not look.
   */
  initialCookie?: string | null;
  /** After every stored decision, the first one included. Synchronous. */
  onChange?: (next: ConsentState, previous: ConsentState | null) => void;
  /** Reloads the page when a category goes from allowed to off. */
  reloadOnWithdraw?: boolean;
}

export interface CookieConsentContextValue {
  /** `null` means undecided — never asked, expired, or asked under another version. */
  consent: ConsentState | null;
  categories: readonly ConsentCategory[];
  /** Required categories are always allowed, every other one only after consent. */
  allows: (id: string) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Stores exactly this selection; missing categories are off. */
  save: (choices: Record<string, boolean>) => void;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

interface CookieConsentState extends CookieConsentContextValue {
  /** False while a server render did not look at the cookie. */
  known: boolean;
}

const CookieConsentContext = React.createContext<CookieConsentState | null>(null);

// Browsers fire no change event for cookies that every target supports, so
// the provider tells its own readers after it writes.
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  for (const listener of listeners) listener();
}

// The server snapshot when the server never looked at the request's cookies.
// A cookie value cannot contain NUL, so this never collides with a real one.
const NOT_LOOKED = '\u0000';

/**
 * The raw value of the newest valid decision among all cookies of this name —
 * an older one, set without or with another Domain, would otherwise hide every
 * new choice, a withdrawal included.
 */
function currentCookie(name: string, options: ParseConsentCookieOptions): string | null {
  const values = readCookieValues(document.cookie, name);
  let newest: { raw: string; decidedAt: number } | null = null;
  for (const raw of values) {
    const state = parseConsentCookie(raw, options);
    if (!state) continue;
    const decidedAt = Date.parse(state.decidedAt);
    if (!newest || decidedAt > newest.decidedAt) newest = { raw, decidedAt };
  }
  return newest?.raw ?? values[0] ?? null;
}

function checkCategories(categories: readonly ConsentCategory[]): void {
  if (!categories.some((category) => category.required)) {
    throw new Error('CookieConsentProvider: one category must be required');
  }
  const seen = new Set<string>();
  for (const { id } of categories) {
    if (seen.has(id)) throw new Error(`CookieConsentProvider: duplicate category id "${id}"`);
    seen.add(id);
  }
}

export function CookieConsentProvider({
  children,
  categories,
  version,
  cookieName = CONSENT_COOKIE_NAME,
  cookieDomain,
  maxAgeDays = CONSENT_MAX_AGE_DAYS,
  initialCookie,
  onChange,
  reloadOnWithdraw = true,
}: CookieConsentProviderProps) {
  checkCategories(categories);

  // The server snapshot also serves the hydration render, so the first
  // browser render matches the HTML and only then switches to document.cookie.
  const raw = React.useSyncExternalStore(
    subscribe,
    () => currentCookie(cookieName, { version, maxAgeDays }),
    () => (initialCookie === undefined ? NOT_LOOKED : initialCookie),
  );
  const known = raw !== NOT_LOOKED;
  const consent = React.useMemo(
    () => (raw === NOT_LOOKED ? null : parseConsentCookie(raw, { version, maxAgeDays })),
    [raw, version, maxAgeDays],
  );

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const warned = React.useRef(new Set<string>());

  const allows = React.useCallback(
    (id: string) => {
      const category = categories.find((candidate) => candidate.id === id);
      if (!category) {
        if (!warned.current.has(id)) {
          warned.current.add(id);
          console.warn(`CookieConsentProvider: unknown category "${id}"`);
        }
        return false;
      }
      return category.required === true || consent?.choices[id] === true;
    },
    [categories, consent],
  );

  const decide = React.useCallback(
    (choices: Record<string, boolean>) => {
      const optional = categories.filter((category) => !category.required);
      const next: ConsentState = {
        version,
        choices: Object.fromEntries(optional.map(({ id }) => [id, choices[id] === true])),
        decidedAt: new Date().toISOString(),
      };
      // Read now, not from the render: a callback captured before the last
      // decision would otherwise compare against a stale choice and skip the
      // reload a withdrawal needs.
      const options = { version, maxAgeDays };
      const previous = parseConsentCookie(currentCookie(cookieName, options), options);

      // The host-only cookie of the same name would outlive this one.
      if (cookieDomain) document.cookie = `${cookieName}=; Max-Age=0; Path=/`;
      document.cookie = formatConsentCookie(next, {
        name: cookieName,
        maxAgeDays,
        domain: cookieDomain,
        secure: window.location.protocol === 'https:',
      });
      notify();
      setSettingsOpen(false);

      // The choice is already stored: a broken handler of the app must not
      // take the visitor's decision back.
      try {
        onChange?.(next, previous);
      } catch (error) {
        console.error(error);
      }

      // A script that already runs cannot be stopped any other way.
      const withdrew = optional.some(({ id }) => previous?.choices[id] === true && !next.choices[id]);
      if (reloadOnWithdraw && withdrew) reloadPage();
    },
    [categories, cookieDomain, cookieName, maxAgeDays, onChange, reloadOnWithdraw, version],
  );

  const value = React.useMemo<CookieConsentState>(() => {
    const optional = categories.filter((category) => !category.required);
    return {
      consent,
      categories,
      known,
      allows,
      acceptAll: () => decide(Object.fromEntries(optional.map(({ id }) => [id, true]))),
      rejectAll: () => decide({}),
      save: decide,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
    };
  }, [allows, categories, consent, decide, known, settingsOpen]);

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

/** With `known`, for the library's own banner. Not exported from the package. */
export function useCookieConsentState(): CookieConsentState {
  const context = React.useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}

export function useCookieConsent(): CookieConsentContextValue {
  return useCookieConsentState();
}

export function useConsent(id: string): boolean {
  return useCookieConsentState().allows(id);
}

export interface ConsentGateProps {
  category: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConsentGate({ category, children, fallback = null }: ConsentGateProps) {
  return <>{useConsent(category) ? children : fallback}</>;
}
