import type { HourCycle } from '../../theme/DateTimeProvider';

export type RelativeTimeFormatMode = 'auto' | 'relative' | 'datetime' | 'duration' | 'micro';
export type RelativeTimeFormatStyle = 'long' | 'short' | 'narrow';
export type RelativeTimeTense = 'auto' | 'past' | 'future';
export type RelativeTimePrecision = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second';

export interface RelativeTimeProps {
  /** A Date object, or anything `new Date(...)` accepts (e.g. an ISO string). */
  date: Date | string;
  /** @default 'auto' */
  format?: RelativeTimeFormatMode;
  formatStyle?: RelativeTimeFormatStyle;
  /** @default 'auto' */
  tense?: RelativeTimeTense;
  /** ISO-8601 duration (e.g. "P30D"). Beyond this, 'auto'/'relative' fall back to an absolute date. @default 'P30D' */
  threshold?: string;
  /** @default 'second' */
  precision?: RelativeTimePrecision;
  /** Overrides DateTimeProvider's value; falls back to the runtime default. */
  locale?: string;
  timeZone?: string;
  hourCycle?: HourCycle;
  /** Suppress the native title tooltip showing the absolute time. @default false */
  noTitle?: boolean;
  className?: string;
  /** Passed straight through to the rendered <time> element; useful for testing. */
  'data-testid'?: string;
}
