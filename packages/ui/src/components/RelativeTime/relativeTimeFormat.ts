import { Duration, elapsedTime, roundToSingleUnit, getRelativeTimeUnit, compareDurations } from './duration';
import {
  dateTimeFormat,
  relativeTimeFormat as intlRelativeTimeFormat,
  durationFormat as intlDurationFormat,
} from './intlCache';
import type { RelativeTimeFormatMode, RelativeTimeFormatStyle, RelativeTimePrecision, RelativeTimeTense } from './types';
import type { HourCycle } from '../../theme/DateTimeProvider';

export interface RelativeTimeFormatOptions {
  format: RelativeTimeFormatMode;
  formatStyle?: RelativeTimeFormatStyle;
  tense: RelativeTimeTense;
  threshold: string;
  precision: RelativeTimePrecision;
  locale?: string;
  timeZone?: string;
  hourCycle?: HourCycle;
}

export interface RelativeTimeFormatResult {
  text: string;
  title: string;
  /** Infinity when this format never needs another scheduled update (e.g. 'datetime'). */
  nextUpdateMs: number;
}

type ResolvedFormat = 'relative' | 'datetime' | 'duration';

function resolveFormat(mode: RelativeTimeFormatMode, duration: Duration, tense: RelativeTimeTense, threshold: string): ResolvedFormat {
  if (mode === 'datetime') return 'datetime';
  // 'micro' always renders as a compact duration-style string regardless of
  // threshold, unlike upstream's narrower explicit-threshold-only carry
  // through -- deliberate simplification (see the plan's Global Constraints).
  if (mode === 'duration' || mode === 'micro') return 'duration';
  // 'relative' always renders relative, ignoring the threshold entirely --
  // only 'auto' does threshold-based smart switching between relative and
  // absolute.
  if (mode === 'relative') return 'relative';
  // mode is 'auto'
  if (tense === 'past' || tense === 'future') return 'relative';
  if (compareDurations(duration, threshold) === 1) return 'relative';
  return 'datetime';
}

function formatAbsolute(date: Date, locale: string | undefined, timeZone: string | undefined, hourCycle: HourCycle | undefined): string {
  return dateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
    hourCycle,
  }).format(date);
}

function getRelativeFormat(
  duration: Duration,
  locale: string | undefined,
  formatStyle: RelativeTimeFormatStyle,
  tense: RelativeTimeTense,
): string {
  const formatter = intlRelativeTimeFormat(locale, { numeric: 'auto', style: formatStyle });
  let effective = duration;
  if (tense === 'future' && duration.sign !== 1) effective = new Duration();
  if (tense === 'past' && duration.sign !== -1) effective = new Duration();
  const [value, unit] = getRelativeTimeUnit(effective);
  if (unit === 'second' && Math.abs(value) < 10) {
    return formatter.format(0, 'second');
  }
  return formatter.format(value, unit);
}

function getDurationFormat(
  duration: Duration,
  locale: string | undefined,
  formatStyle: RelativeTimeFormatStyle | undefined,
  tense: RelativeTimeTense,
): string {
  const style = formatStyle ?? 'long';
  let effective = duration;
  if (tense === 'past' && duration.sign !== -1) effective = new Duration();
  if (tense === 'future' && duration.sign !== 1) effective = new Duration();
  const rounded = roundToSingleUnit(effective);
  if (rounded.blank) {
    // Always shown via seconds, regardless of the configured `precision` --
    // deliberate simplification (see the plan's Global Constraints).
    return intlDurationFormat(locale, { style, secondsDisplay: 'always' }).format({ seconds: 0 });
  }
  const abs = rounded.abs();
  return intlDurationFormat(locale, { style }).format({
    years: abs.years,
    months: abs.months,
    weeks: abs.weeks,
    days: abs.days,
    hours: abs.hours,
    minutes: abs.minutes,
    seconds: abs.seconds,
  });
}

function getMicroFormat(duration: Duration, locale: string | undefined, tense: RelativeTimeTense): string {
  const placeholder = new Duration(0, 0, 0, 0, 0, 1); // 1 minute, matches upstream's "microEmptyDuration"
  let effective = duration;
  if (tense === 'past' && duration.sign !== -1) effective = placeholder;
  if (tense === 'future' && duration.sign !== 1) effective = placeholder;
  const rounded = roundToSingleUnit(effective);
  const [value, unit] = getRelativeTimeUnit(rounded.blank ? placeholder : rounded);
  // For tense="auto", use the duration's actual sign rather than upstream's
  // hardcoded "assume future" default for this case -- deliberate
  // improvement (see the plan's Global Constraints).
  const sign = tense === 'past' ? -1 : tense === 'future' ? 1 : Math.sign(value) || 1;
  const formatter = intlRelativeTimeFormat(locale, { numeric: 'always', style: 'narrow' });
  return formatter.format(Math.abs(value) * sign, unit);
}

function getNextUpdateMs(date: Date, resolved: ResolvedFormat, precision: RelativeTimePrecision, now: number): number {
  if (resolved === 'datetime') return Infinity;
  if (resolved === 'duration') {
    if (precision === 'second') return 1000;
    if (precision === 'minute') return 60_000;
  }
  const ms = Math.abs(now - date.getTime());
  if (ms < 60_000) return 1000;
  if (ms < 60 * 60_000) return 60_000;
  return 60 * 60_000;
}

export function computeRelativeTimeText(date: Date, now: number, options: RelativeTimeFormatOptions): RelativeTimeFormatResult {
  const { format: mode, formatStyle, tense, threshold, precision, locale, timeZone, hourCycle } = options;

  if (Number.isNaN(date.getTime())) {
    return { text: '', title: '', nextUpdateMs: Infinity };
  }

  const duration = elapsedTime(date, precision, now);
  const title = formatAbsolute(date, locale, timeZone, hourCycle);
  const resolved = resolveFormat(mode, duration, tense, threshold);

  let text: string;
  if (resolved === 'datetime') {
    text = title;
  } else if (resolved === 'duration') {
    text = mode === 'micro' ? getMicroFormat(duration, locale, tense) : getDurationFormat(duration, locale, formatStyle, tense);
  } else {
    text = getRelativeFormat(duration, locale, formatStyle ?? 'long', tense);
  }

  return { text, title, nextUpdateMs: getNextUpdateMs(date, resolved, precision, now) };
}
