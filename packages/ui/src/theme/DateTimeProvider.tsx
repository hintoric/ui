'use client';
import * as React from 'react';

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

export function useDateTimeDefaults(): DateTimeContextValue {
  return React.useContext(DateTimeContext) ?? {};
}
