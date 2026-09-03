'use client';
import * as React from 'react';
import { computeRelativeTimeText } from './relativeTimeFormat';
import type { RelativeTimeFormatOptions } from './relativeTimeFormat';
import { scheduleRelativeTimeUpdate } from './relativeTimeScheduler';
import { useDateTimeDefaults } from '../../theme/DateTimeProvider';
import type { RelativeTimeProps } from './types';

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function RelativeTime({
  date: dateProp,
  format = 'auto',
  formatStyle,
  tense = 'auto',
  threshold = 'P30D',
  precision = 'second',
  locale: localeProp,
  timeZone: timeZoneProp,
  hourCycle: hourCycleProp,
  noTitle = false,
  className,
  'data-testid': dataTestId,
}: RelativeTimeProps): React.ReactElement {
  const defaults = useDateTimeDefaults();
  const locale = localeProp ?? defaults.locale;
  const timeZone = timeZoneProp ?? defaults.timeZone;
  const hourCycle = hourCycleProp ?? defaults.hourCycle;

  const date = React.useMemo(() => toDate(dateProp), [dateProp]);
  const options: RelativeTimeFormatOptions = { format, formatStyle, tense, threshold, precision, locale, timeZone, hourCycle };

  const [, forceUpdate] = React.useReducer((n: number) => n + 1, 0);
  const result = computeRelativeTimeText(date, Date.now(), options);
  const needsUpdates = Number.isFinite(result.nextUpdateMs);

  // A ref (not a dependency) so the scheduler always calls the LATEST
  // options/date without the effect below needing to re-run on every tick --
  // it only needs to re-run when whether-we-need-updates-at-all changes.
  const getNextDelayMsRef = React.useRef<() => number>(() => Infinity);
  getNextDelayMsRef.current = () => computeRelativeTimeText(date, Date.now(), options).nextUpdateMs;

  React.useEffect(() => {
    if (!needsUpdates) return undefined;
    return scheduleRelativeTimeUpdate(() => getNextDelayMsRef.current(), forceUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsUpdates, date, format, tense, threshold, precision, locale, timeZone, hourCycle]);

  const isValidDate = !Number.isNaN(date.getTime());

  return (
    <time
      dateTime={isValidDate ? date.toISOString() : undefined}
      title={noTitle ? undefined : result.title || undefined}
      className={className}
      data-testid={dataTestId}
    >
      {result.text}
    </time>
  );
}
