'use client';
import * as React from 'react';

export interface LocaleOption {
  /** The value handed back to `onLocaleChange`. A BCP 47 tag in practice, but not enforced. */
  value: string;
  /** What the user reads. The caller decides whether that is "Deutsch", "German" or "DE". */
  label: React.ReactNode;
  /**
   * ISO 3166-1 alpha-2 country code for the flag, e.g. `AT`. Only needed when
   * the flag should not follow the tag's own region subtag — `de-DE` already
   * resolves to `DE` on its own, but a region-less `de` has nothing to derive
   * from, and `en` deliberately belongs to no single country.
   */
  region?: string;
}

export interface LocaleContextValue {
  locale: string;
  /** `undefined` when the provider got no `onLocaleChange` — then it is a read-only source. */
  setLocale: ((locale: string) => void) | undefined;
  /** `undefined` when the provider got no `locales`. */
  locales: readonly LocaleOption[] | undefined;
}

const LocaleContext = React.createContext<LocaleContextValue | undefined>(undefined);

export interface LocaleProviderProps {
  children: React.ReactNode;
  /** The current language. Required — this provider mirrors, it does not own. */
  locale: string;
  onLocaleChange?: (locale: string) => void;
  locales?: readonly LocaleOption[];
}

/*
 * Deliberately stateless, unlike ColorSchemeProvider. The colour scheme has no
 * owner outside this library; the language does -- in the consuming
 * applications i18next already holds it, with detection, persistence and the
 * loading of translation files. A second copy here would not be one source of
 * truth but a third party to the argument, drifting apart the moment i18next
 * changes the language for a reason other than the switcher.
 */
export function LocaleProvider({ children, locale, onLocaleChange, locales }: LocaleProviderProps) {
  const value = React.useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: onLocaleChange, locales }),
    [locale, onLocaleChange, locales],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = React.useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

/**
 * The non-throwing read of the same context, for components that have to keep
 * working without a provider: `RelativeTime` falls back to the runtime
 * default, `LocaleSwitcher` to its own props. Package-internal — not exported
 * from `index.ts`.
 */
export function useLocaleContext(): LocaleContextValue | undefined {
  return React.useContext(LocaleContext);
}
