'use client';
import * as React from 'react';
import { useLocaleContext } from './LocaleProvider';

export type HourCycle = 'h11' | 'h12' | 'h23' | 'h24';

export interface DateTimeContextValue {
  locale?: string;
  timeZone?: string;
  hourCycle?: HourCycle;
}

const DateTimeContext = React.createContext<DateTimeContextValue | undefined>(undefined);

export interface DateTimeProviderProps extends DateTimeContextValue {
  children: React.ReactNode;
}

// Unlike ColorSchemeProvider, this is entirely optional -- components
// reading it (useDateTimeDefaults) fall back to {} rather than throwing when
// no provider is present, since sensible browser-default formatting works
// fine without ever mounting this. Named generically (not
// "RelativeTimeProvider") so future date/time display components can share
// the same context without a rename.
export function DateTimeProvider({ children, locale, timeZone, hourCycle }: DateTimeProviderProps) {
  const value = React.useMemo(() => ({ locale, timeZone, hourCycle }), [locale, timeZone, hourCycle]);
  return <DateTimeContext.Provider value={value}>{children}</DateTimeContext.Provider>;
}

// The precedence chain lives here, not in the components:
//   prop > DateTimeProvider.locale > LocaleProvider.locale > runtime default.
// The narrower scope wins, so an explicit DateTimeProvider locale ("the UI is
// English but dates are German") survives an app-wide language. Keeping it in
// one place means every future date/time component inherits it for free.
export function useDateTimeDefaults(): DateTimeContextValue {
  const dateTime = React.useContext(DateTimeContext) ?? {};
  const localeContext = useLocaleContext();
  return { ...dateTime, locale: dateTime.locale ?? localeContext?.locale };
}
