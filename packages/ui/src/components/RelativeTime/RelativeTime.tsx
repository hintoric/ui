'use client';
import * as React from 'react';
import { computeRelativeTimeText } from './relativeTimeFormat';
import type { RelativeTimeFormatOptions } from './relativeTimeFormat';
import { scheduleRelativeTimeUpdate } from './relativeTimeScheduler';
import { useDateTimeDefaults } from '../../theme/DateTimeProvider';
import { cx } from '../../utils/cx';
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

  // Seeded once via the lazy initializer (runs a single time, not on every
  // render), so the render body itself never reads the clock -- later values
  // arrive only through the scheduler's onTick below.
  const [now, setNow] = React.useState(() => Date.now());
  const result = computeRelativeTimeText(date, now, options);
  const needsUpdates = Number.isFinite(result.nextUpdateMs);

  // Written in an insertion effect (not during render) so the scheduler can
  // call the LATEST options/date without the effect below needing to re-run
  // on every tick -- it only needs to re-run when whether-we-need-updates-
  // at-all changes.
  const getNextDelayMsRef = React.useRef<() => number>(() => Infinity);
  React.useInsertionEffect(() => {
    getNextDelayMsRef.current = () => computeRelativeTimeText(date, Date.now(), options).nextUpdateMs;
  });

  React.useEffect(() => {
    if (!needsUpdates) return undefined;
    return scheduleRelativeTimeUpdate(() => getNextDelayMsRef.current(), () => setNow(Date.now()));
  }, [needsUpdates]);

  const isValidDate = !Number.isNaN(date.getTime());

  return (
    <time
      dateTime={isValidDate ? date.toISOString() : undefined}
      title={noTitle ? undefined : result.title || undefined}
      // `text-ink-primary` rather than inheriting: RelativeTime used to set
      // no class at all, so on a dark page it rendered the inherited black on
      // near-black and was invisible — its dark screenshots were solid black
      // rectangles. Joy has no RelativeTime to compare against, but every
      // `body-*` typography level in Joy sets a `color`, and this library has
      // ink tokens for exactly that. `primary` rather than `secondary`/
      // `tertiary` because no spec asked for a muted timestamp; this fixes
      // readability without imposing a treatment, and `className` still wins.
      className={cx('text-ink-primary', className)}
      data-testid={dataTestId}
    >
      {result.text}
    </time>
  );
}
