// No React and no 'use client' here: a server reads the same cookie, and this
// file is meant to become a React-free entry point of its own.

export interface ConsentState {
  /** The provider's `version` the choice was made under. */
  version: string;
  /** Every optional category; true means allowed. Required ones are never stored. */
  choices: Record<string, boolean>;
  /** When the choice was made, ISO 8601. */
  decidedAt: string;
}

export interface ParseConsentCookieOptions {
  version: string;
  maxAgeDays?: number;
  now?: Date;
}

export interface ConsentCookieOptions {
  name: string;
  maxAgeDays: number;
  domain?: string;
  secure: boolean;
}

export const CONSENT_COOKIE_NAME = 'hintoric_consent';
export const CONSENT_MAX_AGE_DAYS = 180;

const DAY_MS = 24 * 60 * 60 * 1000;
// Clocks drift, so a decision a few hours "ahead" is still honest. One that is
// days ahead would never expire.
const FUTURE_TOLERANCE_MS = DAY_MS;

function isChoices(value: unknown): value is Record<string, boolean> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((choice) => typeof choice === 'boolean');
}

/**
 * The only place that decides whether a stored choice still counts: a missing,
 * broken or expired cookie, or one from another version, is no choice at all.
 */
export function parseConsentCookie(
  value: string | null | undefined,
  options: ParseConsentCookieOptions,
): ConsentState | null {
  if (!value) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(value));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;

  const { version, choices, decidedAt } = parsed as Record<string, unknown>;
  if (typeof version !== 'string' || typeof decidedAt !== 'string' || !isChoices(choices)) return null;
  if (version !== options.version) return null;

  const decided = Date.parse(decidedAt);
  if (Number.isNaN(decided)) return null;

  const now = (options.now ?? new Date()).getTime();
  const maxAgeDays = options.maxAgeDays ?? CONSENT_MAX_AGE_DAYS;
  if (decided - now > FUTURE_TOLERANCE_MS) return null;
  if (now - decided > maxAgeDays * DAY_MS) return null;

  return { version, choices, decidedAt };
}

/** The raw value of one cookie in a `Cookie` header or `document.cookie`. */
export function readCookieValue(cookieHeader: string, name: string): string | undefined {
  for (const part of cookieHeader.split(';')) {
    const pair = part.trim();
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    if (pair.slice(0, separator) === name) return pair.slice(separator + 1);
  }
  return undefined;
}

/** A string for `document.cookie` that stores `state`. */
export function formatConsentCookie(state: ConsentState, options: ConsentCookieOptions): string {
  const value = encodeURIComponent(
    JSON.stringify({ version: state.version, choices: state.choices, decidedAt: state.decidedAt }),
  );
  const attributes = [
    `${options.name}=${value}`,
    `Max-Age=${options.maxAgeDays * 24 * 60 * 60}`,
    'Path=/',
    'SameSite=Lax',
  ];
  if (options.domain) attributes.push(`Domain=${options.domain}`);
  if (options.secure) attributes.push('Secure');
  return attributes.join('; ');
}
