# RelativeTime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `RelativeTime` component (plus a shared, optional `DateTimeProvider` context) to `@hintoric/ui` that displays a timestamp as "3 minutes ago" / "in 2 days", auto-updates over time via one shared scheduler for the whole app, and shows the absolute time in a native tooltip — ported from analyzing the real `@github/relative-time-element` source.

**Architecture:** Pure formatting logic (`duration.ts` + `relativeTimeFormat.ts`, no React) computes `{ text, title, nextUpdateMs }` from a date and options using native `Intl.RelativeTimeFormat`/`Intl.DateTimeFormat`/`Intl.DurationFormat` — no external date library. A module-level scheduler singleton (`relativeTimeScheduler.ts`) batches every mounted `RelativeTime` instance behind one shared `setTimeout`, mirroring GitHub's `dateObserver`. `RelativeTime.tsx` wires the two together and renders a plain `<time>` element; no Base UI primitive is needed (no accessibility-behavior gap to fill).

**Tech Stack:** React 19, TypeScript, native `Intl.RelativeTimeFormat`/`Intl.DateTimeFormat`/`Intl.DurationFormat` (no date library), Vitest (jsdom with `vi.useFakeTimers()` + real-browser self-baseline visual tests).

**Spec:** [docs/superpowers/specs/2026-09-04-relative-time-design.md](../specs/2026-09-04-relative-time-design.md)

## Global Constraints

- No external date/time library — everything is built on native `Intl.*` APIs, per the spec's Section 2 finding that GitHub's own implementation needs none either.
- `Intl.DurationFormat` is used natively (confirmed available in Node 24 and current evergreen browsers) — GitHub's own 149-line ponyfill for it is **not** ported; if it's ever unavailable in a target browser, `format="duration"`/`"micro"` degrade is out of scope for this phase.
- `packages/ui` needs `Intl.DurationFormat`/`Intl.DurationFormatOptions` **types**, which require adding `"ES2025.Intl"` to `tsconfig.base.json`'s `lib` array (verified: TypeScript 6.0.3, already installed in this repo, ships these types under that lib name — confirmed by compiling a throwaway file with `--lib ES2022,DOM,DOM.Iterable,ES2025.Intl`).
- Per the spec's Section 3 (a documented, approved exception to `CLAUDE.md`'s Joy-comparison rule, same reasoning as `DataGrid`): `RelativeTime`'s visual test is self-baseline `toMatchScreenshot()` only — no `getComputedStyle()`-vs-`@mui/joy` comparison, since Joy UI has no equivalent component.
- `DateTimeProvider` is **optional** — unlike `ColorSchemeProvider`, `useDateTimeDefaults()` must return `{}` when no provider is mounted, never throw.
- Precedence for `locale`/`timeZone`/`hourCycle`: explicit prop on `RelativeTime` > `DateTimeProvider` context value > `undefined` (native `Intl` runtime default).
- This plan deliberately simplifies a few corners of the upstream algorithm relative to the analyzed source, each documented inline in the relevant task's code: `micro` mode always resolves to a compact duration-style string regardless of `threshold` (upstream has a separate, narrower explicit-threshold-only carry-through for this); blank/zero durations in `duration`/`micro` mode always render via `secondsDisplay: 'always'` regardless of the configured `precision`; `micro` mode's tense-less (`tense="auto"`) sign uses the duration's actual sign rather than upstream's hardcoded "assume future" default.

---

## Task 1: Enable `Intl.DurationFormat` types

**Files:**
- Modify: `tsconfig.base.json`

**Interfaces:**
- Produces: `Intl.DurationFormat`/`Intl.DurationFormatOptions`/`Intl.DurationInput` types available to every workspace package's TypeScript compilation.

- [ ] **Step 1: Add the lib entry**

In `tsconfig.base.json`, change:

```json
"lib": ["ES2022", "DOM", "DOM.Iterable"],
```

to:

```json
"lib": ["ES2022", "DOM", "DOM.Iterable", "ES2025.Intl"],
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm --filter @hintoric/ui typecheck`
Expected: no errors (this task alone doesn't use the new types yet, but confirms the config change itself doesn't break anything).

- [ ] **Step 3: Commit**

```bash
git add tsconfig.base.json
git commit -m "chore: enable Intl.DurationFormat types (ES2025.Intl lib)"
```

---

## Task 2: `duration.ts` — Duration class and calendar-aware elapsed-time math

**Files:**
- Create: `packages/ui/src/components/RelativeTime/duration.ts`
- Test: `packages/ui/src/components/RelativeTime/duration.test.ts`

**Interfaces:**
- Consumes: nothing (first file in this feature).
- Produces: `Duration` class, `elapsedTime(date, precision, now)`, `roundToSingleUnit(duration, opts?)`, `getRelativeTimeUnit(duration, opts?)`, `isDuration(str)`, `parseDuration(str)`, `applyDuration(date, duration)`, `compareDurations(one, two)`, `type Unit` — consumed by Task 4 (`relativeTimeFormat.ts`).

This is a faithful port of `@github/relative-time-element`'s `src/duration.ts` (MIT licensed, Copyright (c) GitHub, Inc. — https://github.com/github/relative-time-element). The calendar-aware rounding (correctly resolving "23 hours" to "yesterday", "26 days" to "last month", "11-13 months" to "last year") was verified against representative cases in a throwaway Node script before writing it here — every case below matches that verified output.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ui/src/components/RelativeTime/duration.test.ts
import { describe, expect, it } from 'vitest';
import { Duration, elapsedTime, getRelativeTimeUnit, isDuration, parseDuration, applyDuration, compareDurations } from './duration';

describe('Duration', () => {
  it('computes sign from the first non-zero field', () => {
    expect(new Duration(0, 0, 0, -3).sign).toBe(-1);
    expect(new Duration(0, 0, 0, 3).sign).toBe(1);
    expect(new Duration().sign).toBe(0);
    expect(new Duration().blank).toBe(true);
  });

  it('abs() returns all-positive magnitudes with the same shape', () => {
    const d = new Duration(0, 0, 0, -3, -4);
    expect(d.abs()).toMatchObject({ days: 3, hours: 4 });
  });
});

describe('elapsedTime + getRelativeTimeUnit (calendar-aware rounding)', () => {
  const now = new Date('2026-09-04T12:00:00Z').getTime();

  function unitFor(targetIso: string) {
    const duration = elapsedTime(new Date(targetIso), 'second', now);
    return getRelativeTimeUnit(duration);
  }

  it('rounds sub-minute durations to seconds', () => {
    expect(unitFor('2026-09-04T11:59:30Z')).toEqual([-30, 'second']);
  });

  it('rounds sub-hour durations to minutes', () => {
    expect(unitFor('2026-09-04T11:15:00Z')).toEqual([-45, 'minute']);
  });

  it('rounds ~23 hours to 1 day (not 23 hours)', () => {
    expect(unitFor('2026-09-03T13:00:00Z')).toEqual([-1, 'day']);
  });

  it('rounds ~28 hours to 1 day', () => {
    expect(unitFor('2026-09-03T08:00:00Z')).toEqual([-1, 'day']);
  });

  it('keeps 3 days as days', () => {
    expect(unitFor('2026-09-01T12:00:00Z')).toEqual([-3, 'day']);
  });

  it('rounds 6-10 days to weeks', () => {
    expect(unitFor('2026-08-29T12:00:00Z')).toEqual([-1, 'week']);
    expect(unitFor('2026-08-25T12:00:00Z')).toEqual([-1, 'week']);
  });

  it('keeps 2 weeks as weeks', () => {
    expect(unitFor('2026-08-21T12:00:00Z')).toEqual([-2, 'week']);
  });

  it('rounds 26 days to 1 month', () => {
    expect(unitFor('2026-08-09T12:00:00Z')).toEqual([-1, 'month']);
  });

  it('keeps 2 months as months', () => {
    expect(unitFor('2026-07-04T12:00:00Z')).toEqual([-2, 'month']);
  });

  it('rounds 11 and 13 months to 1 year', () => {
    expect(unitFor('2025-10-04T12:00:00Z')).toEqual([-1, 'year']);
    expect(unitFor('2025-08-04T12:00:00Z')).toEqual([-1, 'year']);
  });

  it('keeps 2 years as years', () => {
    expect(unitFor('2024-09-04T12:00:00Z')).toEqual([-2, 'year']);
  });

  it('handles future dates with a positive sign', () => {
    expect(unitFor('2026-09-07T12:00:00Z')).toEqual([3, 'day']);
    expect(unitFor('2026-11-04T12:00:00Z')).toEqual([2, 'month']);
  });
});

describe('ISO-8601 duration parsing', () => {
  it('recognizes valid ISO-8601 durations', () => {
    expect(isDuration('P30D')).toBe(true);
    expect(isDuration('P1Y2M3D')).toBe(true);
    expect(isDuration('not-a-duration')).toBe(false);
  });

  it('parses a duration string into its fields', () => {
    const d = parseDuration('P30D');
    expect(d).toMatchObject({ days: 30 });
  });

  it('applies a duration to a date', () => {
    const result = applyDuration(new Date('2026-01-01T00:00:00Z'), parseDuration('P30D'));
    expect(result.toISOString()).toBe('2026-01-31T00:00:00.000Z');
  });

  it('compares two durations by their applied magnitude', () => {
    // A 3-day duration is smaller (closer to now) than a 30-day threshold.
    expect(compareDurations(parseDuration('P3D'), 'P30D')).toBe(1);
    // A 60-day duration is larger (farther from now) than a 30-day threshold.
    expect(compareDurations(parseDuration('P60D'), 'P30D')).toBe(-1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- duration.test`
Expected: FAIL with "Cannot find module './duration'".

- [ ] **Step 3: Write `duration.ts`**

```ts
// A faithful port of @github/relative-time-element's Duration class and its
// elapsedTime/roundToSingleUnit/getRelativeTimeUnit algorithm
// (MIT licensed, Copyright (c) GitHub, Inc. —
// https://github.com/github/relative-time-element/blob/main/src/duration.ts).
// This calendar-aware rounding (correctly resolving "23 hours" to
// "yesterday", "26 days" to "last month", "11-13 months" to "last year",
// etc.) is exactly the kind of logic worth reusing rather than re-deriving —
// verified against representative cases in a throwaway Node script before
// writing it here.

export type Unit = 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';

const unitNames: readonly Unit[] = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

type Sign = -1 | 0 | 1;

export class Duration {
  readonly years: number;
  readonly months: number;
  readonly weeks: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  readonly sign: Sign;
  readonly blank: boolean;

  constructor(years = 0, months = 0, weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0) {
    this.years = years || 0;
    this.months = months || 0;
    this.weeks = weeks || 0;
    this.days = days || 0;
    this.hours = hours || 0;
    this.minutes = minutes || 0;
    this.seconds = seconds || 0;
    this.milliseconds = milliseconds || 0;
    let sign: Sign = 0;
    sign ||= Math.sign(this.years) as Sign;
    sign ||= Math.sign(this.months) as Sign;
    sign ||= Math.sign(this.weeks) as Sign;
    sign ||= Math.sign(this.days) as Sign;
    sign ||= Math.sign(this.hours) as Sign;
    sign ||= Math.sign(this.minutes) as Sign;
    sign ||= Math.sign(this.seconds) as Sign;
    sign ||= Math.sign(this.milliseconds) as Sign;
    this.sign = sign;
    this.blank = this.sign === 0;
  }

  abs(): Duration {
    return new Duration(
      Math.abs(this.years),
      Math.abs(this.months),
      Math.abs(this.weeks),
      Math.abs(this.days),
      Math.abs(this.hours),
      Math.abs(this.minutes),
      Math.abs(this.seconds),
      Math.abs(this.milliseconds),
    );
  }
}

export function elapsedTime(date: Date, precision: Unit = 'second', now: number = Date.now()): Duration {
  const delta = date.getTime() - now;
  if (delta === 0) return new Duration();
  const sign = Math.sign(delta);
  const ms = Math.abs(delta);
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(month / 12);
  const i = unitNames.indexOf(precision);
  return new Duration(
    i >= 0 ? year * sign : 0,
    i >= 1 ? (month - year * 12) * sign : 0,
    0,
    i >= 3 ? (day - month * 30) * sign : 0,
    i >= 4 ? (hr - day * 24) * sign : 0,
    i >= 5 ? (min - hr * 60) * sign : 0,
    i >= 6 ? (sec - min * 60) * sign : 0,
    i >= 7 ? (ms - sec * 1000) * sign : 0,
  );
}

export interface RoundingOptions {
  relativeTo?: Date | number;
}

export function roundToSingleUnit(duration: Duration, { relativeTo = Date.now() }: RoundingOptions = {}): Duration {
  const relativeToDate = new Date(relativeTo);
  if (duration.blank) return duration;
  const sign = duration.sign;
  let years = Math.abs(duration.years);
  let months = Math.abs(duration.months);
  let weeks = Math.abs(duration.weeks);
  let days = Math.abs(duration.days);
  let hours = Math.abs(duration.hours);
  let minutes = Math.abs(duration.minutes);
  let seconds = Math.abs(duration.seconds);
  let milliseconds = Math.abs(duration.milliseconds);

  if (milliseconds >= 900) seconds += Math.round(milliseconds / 1000);
  if (seconds || minutes || hours || days || weeks || months || years) milliseconds = 0;

  if (seconds >= 55) minutes += Math.round(seconds / 60);
  if (minutes || hours || days || weeks || months || years) seconds = 0;

  if (minutes >= 55) hours += Math.round(minutes / 60);
  if (hours || days || weeks || months || years) minutes = 0;

  if (days && hours >= 12) days += Math.round(hours / 24);
  if (!days && hours >= 21) days += Math.round(hours / 24);
  if (days || weeks || months || years) hours = 0;

  const currentYear = relativeToDate.getFullYear();
  const currentMonth = relativeToDate.getMonth();
  const currentDate = relativeToDate.getDate();
  if (days >= 27 || years + months + days) {
    const newMonthDate = new Date(relativeToDate);
    newMonthDate.setDate(1);
    newMonthDate.setMonth(currentMonth + months * sign + 1);
    newMonthDate.setDate(0);
    const monthDateCorrection = Math.max(0, currentDate - newMonthDate.getDate());

    const newDate = new Date(relativeToDate);
    newDate.setFullYear(currentYear + years * sign);
    newDate.setDate(currentDate - monthDateCorrection);
    newDate.setMonth(currentMonth + months * sign);
    newDate.setDate(currentDate - monthDateCorrection + days * sign);
    const yearDiff = newDate.getFullYear() - relativeToDate.getFullYear();
    const monthDiff = newDate.getMonth() - relativeToDate.getMonth();
    const daysDiff = Math.abs(Math.round((Number(newDate) - Number(relativeToDate)) / 86400000)) + monthDateCorrection;
    const monthsDiff = Math.abs(yearDiff * 12 + monthDiff);
    if (daysDiff < 27) {
      if (days >= 6) {
        weeks += Math.round(days / 7);
        days = 0;
      } else {
        days = daysDiff;
      }
      months = 0;
      years = 0;
    } else if (monthsDiff <= 11) {
      months = monthsDiff;
      years = 0;
    } else {
      months = 0;
      years = yearDiff * sign;
    }
    if (months || years) days = 0;
  }
  if (years) months = 0;

  if (weeks >= 4) months += Math.round(weeks / 4);
  if (months || years) weeks = 0;
  if (days && weeks && !months && !years) {
    weeks += Math.round(days / 7);
    days = 0;
  }

  return new Duration(
    years * sign,
    months * sign,
    weeks * sign,
    days * sign,
    hours * sign,
    minutes * sign,
    seconds * sign,
    milliseconds * sign,
  );
}

export function getRelativeTimeUnit(duration: Duration, opts?: RoundingOptions): [number, Intl.RelativeTimeFormatUnit] {
  const rounded = roundToSingleUnit(duration, opts);
  if (rounded.blank) return [0, 'second'];
  const unitValues: Record<Unit, number> = {
    year: rounded.years,
    month: rounded.months,
    week: rounded.weeks,
    day: rounded.days,
    hour: rounded.hours,
    minute: rounded.minutes,
    second: rounded.seconds,
    millisecond: rounded.milliseconds,
  };
  for (const unit of unitNames) {
    if (unit === 'millisecond') continue;
    const val = unitValues[unit];
    if (val) return [val, unit as Intl.RelativeTimeFormatUnit];
  }
  return [0, 'second'];
}

// ISO-8601 duration parsing, used for the `threshold` prop (e.g. "P30D").
const durationRe = /^[-+]?P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

export function isDuration(str: string): boolean {
  return durationRe.test(str);
}

export function parseDuration(input: string): Duration {
  const str = input.trim();
  const factor = str.startsWith('-') ? -1 : 1;
  const match = str.match(durationRe);
  if (!match) return new Duration();
  const [years, months, weeks, days, hours, minutes, seconds] = match.slice(1).map((x) => (Number(x) || 0) * factor);
  return new Duration(years, months, weeks, days, hours, minutes, seconds);
}

export function applyDuration(date: Date | number, duration: Duration): Date {
  const result = new Date(date);
  if (duration.sign < 0) {
    result.setUTCSeconds(result.getUTCSeconds() + duration.seconds);
    result.setUTCMinutes(result.getUTCMinutes() + duration.minutes);
    result.setUTCHours(result.getUTCHours() + duration.hours);
    result.setUTCDate(result.getUTCDate() + duration.weeks * 7 + duration.days);
    result.setUTCMonth(result.getUTCMonth() + duration.months);
    result.setUTCFullYear(result.getUTCFullYear() + duration.years);
  } else {
    result.setUTCFullYear(result.getUTCFullYear() + duration.years);
    result.setUTCMonth(result.getUTCMonth() + duration.months);
    result.setUTCDate(result.getUTCDate() + duration.weeks * 7 + duration.days);
    result.setUTCHours(result.getUTCHours() + duration.hours);
    result.setUTCMinutes(result.getUTCMinutes() + duration.minutes);
    result.setUTCSeconds(result.getUTCSeconds() + duration.seconds);
  }
  return result;
}

/**
 * -1 if `one` is farther from now (in either direction) than `two`, 1 if
 * closer, 0 if equal. Used to compare an elapsed duration against the
 * `threshold` prop.
 */
export function compareDurations(one: Duration | string, two: Duration | string): -1 | 0 | 1 {
  const now = Date.now();
  const oneDuration = typeof one === 'string' ? parseDuration(one) : one;
  const twoDuration = typeof two === 'string' ? parseDuration(two) : two;
  const oneApplied = Math.abs(applyDuration(now, oneDuration).getTime() - now);
  const twoApplied = Math.abs(applyDuration(now, twoDuration).getTime() - now);
  if (oneApplied > twoApplied) return -1;
  if (oneApplied < twoApplied) return 1;
  return 0;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- duration.test`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/RelativeTime/duration.ts packages/ui/src/components/RelativeTime/duration.test.ts
git commit -m "feat: add duration.ts, a port of relative-time-element's calendar-aware elapsed-time math"
```

---

## Task 3: `intlCache.ts` — memoized Intl formatter factories

**Files:**
- Create: `packages/ui/src/components/RelativeTime/intlCache.ts`
- Test: `packages/ui/src/components/RelativeTime/intlCache.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `dateTimeFormat(locale, options?)`, `relativeTimeFormat(locale, options?)`, `durationFormat(locale, options?)` — each returns a cached `Intl.*` formatter instance, consumed by Task 4.

Constructing an `Intl.*Format` instance is expensive relative to calling `.format()` on it, and `RelativeTime` recomputes its text on every scheduler tick — reusing one formatter instance per (locale, options) combination avoids rebuilding one on every tick. Ported from `@github/relative-time-element`'s `src/intl-cache.ts` (MIT licensed), trimmed to only the three formatter kinds this component needs (dropping `numberFormat`/`getLocale`/the `languagechange` cache-invalidation listener, which exist upstream to support features — per-field date formatting options, `Intl.Locale` resolution — that are out of scope here per the spec's simpler prop set).

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ui/src/components/RelativeTime/intlCache.test.ts
import { describe, expect, it } from 'vitest';
import { dateTimeFormat, relativeTimeFormat, durationFormat } from './intlCache';

describe('intlCache', () => {
  it('returns a working Intl.DateTimeFormat', () => {
    const formatter = dateTimeFormat('en', { year: 'numeric' });
    expect(formatter.format(new Date('2026-01-01T00:00:00Z'))).toContain('2026');
  });

  it('reuses the same DateTimeFormat instance for identical (locale, options)', () => {
    const a = dateTimeFormat('en', { year: 'numeric' });
    const b = dateTimeFormat('en', { year: 'numeric' });
    expect(a).toBe(b);
  });

  it('returns a different instance for different options', () => {
    const a = dateTimeFormat('en', { year: 'numeric' });
    const b = dateTimeFormat('en', { year: '2-digit' });
    expect(a).not.toBe(b);
  });

  it('returns a working Intl.RelativeTimeFormat', () => {
    const formatter = relativeTimeFormat('en', { numeric: 'auto' });
    expect(formatter.format(-3, 'day')).toBe('3 days ago');
  });

  it('reuses the same RelativeTimeFormat instance for identical (locale, options)', () => {
    const a = relativeTimeFormat('en', { numeric: 'auto' });
    const b = relativeTimeFormat('en', { numeric: 'auto' });
    expect(a).toBe(b);
  });

  it('returns a working Intl.DurationFormat', () => {
    const formatter = durationFormat('en', { style: 'long' });
    expect(formatter.format({ days: 3 })).toContain('3');
  });

  it('reuses the same DurationFormat instance for identical (locale, options)', () => {
    const a = durationFormat('en', { style: 'long' });
    const b = durationFormat('en', { style: 'long' });
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- intlCache.test`
Expected: FAIL with "Cannot find module './intlCache'".

- [ ] **Step 3: Write `intlCache.ts`**

```ts
// Memoized Intl.*Format factories, trimmed from
// @github/relative-time-element's src/intl-cache.ts (MIT licensed,
// Copyright (c) GitHub, Inc.) to the three formatter kinds this component
// needs. A plain Map (not upstream's bounded LRU) is enough here: the key
// space is small in practice (a handful of distinct (locale, options)
// combinations per app, not one per rendered element), unlike upstream's
// unbounded-locale web-component context.
class FormatterCache<V> {
  #map = new Map<string, V>();

  get(key: string): V | undefined {
    return this.#map.get(key);
  }

  set(key: string, value: V): void {
    this.#map.set(key, value);
  }
}

function cacheKey(locale: string | undefined, options?: object): string {
  return `${locale ?? ''} ${options ? JSON.stringify(options) : ''}`;
}

const dateTimeFormats = new FormatterCache<Intl.DateTimeFormat>();
export function dateTimeFormat(locale: string | undefined, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = cacheKey(locale, options);
  let formatter = dateTimeFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    dateTimeFormats.set(key, formatter);
  }
  return formatter;
}

const relativeTimeFormats = new FormatterCache<Intl.RelativeTimeFormat>();
export function relativeTimeFormat(
  locale: string | undefined,
  options?: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
  const key = cacheKey(locale, options);
  let formatter = relativeTimeFormats.get(key);
  if (!formatter) {
    formatter = new Intl.RelativeTimeFormat(locale, options);
    relativeTimeFormats.set(key, formatter);
  }
  return formatter;
}

const durationFormats = new FormatterCache<Intl.DurationFormat>();
export function durationFormat(locale: string | undefined, options?: Intl.DurationFormatOptions): Intl.DurationFormat {
  const key = cacheKey(locale, options);
  let formatter = durationFormats.get(key);
  if (!formatter) {
    formatter = new Intl.DurationFormat(locale, options);
    durationFormats.set(key, formatter);
  }
  return formatter;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- intlCache.test`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/RelativeTime/intlCache.ts packages/ui/src/components/RelativeTime/intlCache.test.ts
git commit -m "feat: add intlCache, memoized Intl.*Format factories"
```

---

## Task 4: `types.ts` and `relativeTimeFormat.ts` — the formatting orchestration

**Files:**
- Create: `packages/ui/src/components/RelativeTime/types.ts`
- Create: `packages/ui/src/components/RelativeTime/relativeTimeFormat.ts`
- Test: `packages/ui/src/components/RelativeTime/relativeTimeFormat.test.ts`

**Interfaces:**
- Consumes: `Duration`, `elapsedTime`, `roundToSingleUnit`, `getRelativeTimeUnit`, `compareDurations` (Task 2); `dateTimeFormat`, `relativeTimeFormat` as `relativeTimeFormatter`, `durationFormat` (Task 3, aliased to avoid a name clash with this file's own exported `computeRelativeTimeText`... see Step 3 for the actual import alias used).
- Produces: `RelativeTimeFormatMode`, `RelativeTimeFormatStyle`, `RelativeTimeTense`, `RelativeTimePrecision`, `RelativeTimeProps` (from `types.ts`); `computeRelativeTimeText(date, now, options): RelativeTimeFormatResult` (from `relativeTimeFormat.ts`) — consumed by Task 6 (`RelativeTime.tsx`).

- [ ] **Step 1: Write `types.ts`**

```ts
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
```

(This file has a forward dependency on `../../theme/DateTimeProvider`'s `HourCycle` type, which Task 5 creates. TypeScript's `import type` is erased at compile time and doesn't care about file-creation order within a task-by-task plan, but if you're implementing tasks strictly in order, Task 5 must exist before this file typechecks — running `pnpm test` for Task 4 before Task 5 exists will fail to compile. To keep every task's own tests genuinely green in isolation, do Task 5 (`DateTimeProvider.tsx`) before this task if executing strictly in file-existence order; the task numbering here follows the spec's own presentation order, not a strict dependency order — reorder Tasks 4 and 5 if your workflow requires each task's tests to pass before the next task exists.)

- [ ] **Step 2: Write the failing tests**

```ts
// packages/ui/src/components/RelativeTime/relativeTimeFormat.test.ts
import { describe, expect, it } from 'vitest';
import { computeRelativeTimeText } from './relativeTimeFormat';

const now = new Date('2026-09-04T12:00:00Z').getTime();

describe('computeRelativeTimeText', () => {
  it('format="auto" renders a relative string within the threshold', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'auto',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
    });
    expect(result.text).toBe('3 days ago');
  });

  it('format="auto" falls back to an absolute date beyond the threshold', () => {
    const result = computeRelativeTimeText(new Date('2026-01-01T12:00:00Z'), now, {
      format: 'auto',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
      locale: 'en',
      timeZone: 'UTC',
    });
    expect(result.text).not.toMatch(/ago|in /);
    expect(result.text).toContain('2026');
  });

  it('format="relative" always renders relative, ignoring the threshold', () => {
    const result = computeRelativeTimeText(new Date('2026-01-01T12:00:00Z'), now, {
      format: 'relative',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
    });
    expect(result.text).toMatch(/ago$/);
  });

  it('format="datetime" always renders an absolute date and never needs updates', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'datetime',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
      locale: 'en',
      timeZone: 'UTC',
    });
    expect(result.text).toContain('2026');
    expect(result.nextUpdateMs).toBe(Infinity);
  });

  it('tense="future" collapses a past date to a neutral/blank result', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'relative',
      tense: 'future',
      threshold: 'P30D',
      precision: 'second',
    });
    expect(result.text).toMatch(/now|in 0/);
  });

  it('title is always the formatted absolute time, independent of format', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'relative',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
      locale: 'en',
      timeZone: 'UTC',
    });
    expect(result.title).toContain('2026');
    expect(result.title).toContain('Sep');
  });

  it('an invalid date does not throw and renders empty text', () => {
    const result = computeRelativeTimeText(new Date('not-a-date'), now, {
      format: 'auto',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
    });
    expect(result.text).toBe('');
    expect(result.nextUpdateMs).toBe(Infinity);
  });

  it('format="duration" renders a magnitude without "ago"/"in"', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'duration',
      formatStyle: 'long',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
      locale: 'en',
    });
    expect(result.text).toBe('3 days');
  });

  it('format="micro" renders a compact relative string', () => {
    const result = computeRelativeTimeText(new Date('2026-09-01T12:00:00Z'), now, {
      format: 'micro',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
      locale: 'en',
    });
    expect(result.text).toBe('3d ago');
  });

  it('nextUpdateMs is finer for durations under a minute than for durations under an hour', () => {
    const soon = computeRelativeTimeText(new Date(now - 30_000), now, {
      format: 'auto',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
    });
    const later = computeRelativeTimeText(new Date(now - 30 * 60_000), now, {
      format: 'auto',
      tense: 'auto',
      threshold: 'P30D',
      precision: 'second',
    });
    expect(soon.nextUpdateMs).toBe(1000);
    expect(later.nextUpdateMs).toBe(60_000);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- relativeTimeFormat.test`
Expected: FAIL with "Cannot find module './relativeTimeFormat'".

- [ ] **Step 4: Write `relativeTimeFormat.ts`**

```ts
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
  // through — deliberate simplification (see Global Constraints).
  if (mode === 'duration' || mode === 'micro') return 'duration';
  // mode is 'auto' or 'relative'
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
    // deliberate simplification (see Global Constraints).
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
  // improvement (see Global Constraints).
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- relativeTimeFormat.test`
Expected: PASS (all 10 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/RelativeTime/types.ts packages/ui/src/components/RelativeTime/relativeTimeFormat.ts packages/ui/src/components/RelativeTime/relativeTimeFormat.test.ts
git commit -m "feat: add relativeTimeFormat, the format-resolution orchestration for RelativeTime"
```

---

## Task 5: `DateTimeProvider` — optional shared locale/timeZone/hourCycle context

**Files:**
- Create: `packages/ui/src/theme/DateTimeProvider.tsx`
- Test: `packages/ui/src/theme/DateTimeProvider.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `HourCycle` type, `DateTimeContextValue` interface, `DateTimeProvider` component, `useDateTimeDefaults()` hook — consumed by Task 4's `types.ts` (for `HourCycle`) and Task 6 (`RelativeTime.tsx`, for `useDateTimeDefaults`).

Note: as flagged in Task 4, this task has no dependency on Task 4 or later, so if you're implementing strictly in the order files must exist for each task's own tests to compile standalone, do this task before Task 4.

Unlike `ColorSchemeProvider` (required — `useColorScheme()` throws without one, and it also renders a DOM wrapper), `DateTimeProvider` is a pure, optional context default: `RelativeTime` must work correctly with sensible browser defaults even when no `DateTimeProvider` is ever mounted.

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/ui/src/theme/DateTimeProvider.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateTimeProvider, useDateTimeDefaults } from './DateTimeProvider';

function Consumer() {
  const defaults = useDateTimeDefaults();
  return <span data-testid="defaults">{JSON.stringify(defaults)}</span>;
}

describe('DateTimeProvider', () => {
  it('useDateTimeDefaults returns {} when no provider is mounted', () => {
    render(<Consumer />);
    expect(screen.getByTestId('defaults')).toHaveTextContent('{}');
  });

  it('provides the given locale/timeZone/hourCycle to descendants', () => {
    render(
      <DateTimeProvider locale="de-DE" timeZone="Europe/Berlin" hourCycle="h23">
        <Consumer />
      </DateTimeProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults).toEqual({ locale: 'de-DE', timeZone: 'Europe/Berlin', hourCycle: 'h23' });
  });

  it('supports partial values', () => {
    render(
      <DateTimeProvider timeZone="UTC">
        <Consumer />
      </DateTimeProvider>,
    );
    const defaults = JSON.parse(screen.getByTestId('defaults').textContent!);
    expect(defaults.timeZone).toBe('UTC');
    expect(defaults.locale).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- DateTimeProvider.test`
Expected: FAIL with "Cannot find module './DateTimeProvider'".

- [ ] **Step 3: Write `DateTimeProvider.tsx`**

```tsx
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- DateTimeProvider.test`
Expected: PASS (all 3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/theme/DateTimeProvider.tsx packages/ui/src/theme/DateTimeProvider.test.tsx
git commit -m "feat: add DateTimeProvider, an optional shared locale/timeZone/hourCycle context"
```

---

## Task 6: `relativeTimeScheduler.ts` — one shared timer for every mounted instance

**Files:**
- Create: `packages/ui/src/components/RelativeTime/relativeTimeScheduler.ts`
- Test: `packages/ui/src/components/RelativeTime/relativeTimeScheduler.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `scheduleRelativeTimeUpdate(getNextDelayMs: () => number, onTick: () => void): () => void` (the returned function unsubscribes) — consumed by Task 7 (`RelativeTime.tsx`).

Mirrors `@github/relative-time-element`'s `dateObserver` singleton: every registered listener contributes a "how soon do I next need an update" function; the scheduler always sets exactly one `setTimeout`, at the minimum delay across all listeners, and re-evaluates after every tick and every registration change.

- [ ] **Step 1: Write the failing tests**

```ts
// packages/ui/src/components/RelativeTime/relativeTimeScheduler.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { scheduleRelativeTimeUpdate } from './relativeTimeScheduler';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduleRelativeTimeUpdate', () => {
  it('sets exactly one timer for multiple registered listeners', () => {
    scheduleRelativeTimeUpdate(() => 1000, () => {});
    scheduleRelativeTimeUpdate(() => 5000, () => {});
    scheduleRelativeTimeUpdate(() => 2000, () => {});
    expect(vi.getTimerCount()).toBe(1);
  });

  it('fires at the minimum delay across all listeners', () => {
    const onTickA = vi.fn();
    const onTickB = vi.fn();
    scheduleRelativeTimeUpdate(() => 5000, onTickA);
    scheduleRelativeTimeUpdate(() => 1000, onTickB);

    vi.advanceTimersByTime(999);
    expect(onTickA).not.toHaveBeenCalled();
    expect(onTickB).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    // Both listeners are ticked together, even though only B's delay elapsed --
    // matches upstream's dateObserver, which updates every registered
    // element whenever the shared timer fires.
    expect(onTickA).toHaveBeenCalledTimes(1);
    expect(onTickB).toHaveBeenCalledTimes(1);
  });

  it('reschedules after a tick using each listener\'s fresh delay', () => {
    let delay = 1000;
    const onTick = vi.fn();
    scheduleRelativeTimeUpdate(() => delay, onTick);

    vi.advanceTimersByTime(1000);
    expect(onTick).toHaveBeenCalledTimes(1);

    delay = 60_000;
    vi.advanceTimersByTime(59_999);
    expect(onTick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it('unsubscribing stops that listener from being ticked', () => {
    const onTick = vi.fn();
    const unsubscribe = scheduleRelativeTimeUpdate(() => 1000, onTick);
    unsubscribe();
    vi.advanceTimersByTime(5000);
    expect(onTick).not.toHaveBeenCalled();
  });

  it('clears the timer entirely once the last listener unsubscribes', () => {
    const unsubscribe = scheduleRelativeTimeUpdate(() => 1000, () => {});
    expect(vi.getTimerCount()).toBe(1);
    unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a newly-registered listener needing a sooner update reschedules the existing timer', () => {
    const onTick = vi.fn();
    scheduleRelativeTimeUpdate(() => 10_000, onTick);
    expect(vi.getTimerCount()).toBe(1);

    scheduleRelativeTimeUpdate(() => 1000, () => {});
    vi.advanceTimersByTime(1000);
    // The second registration should have moved the shared timer up to 1000ms,
    // so the first listener's onTick fires at 1000ms too, not 10000ms.
    expect(onTick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- relativeTimeScheduler.test`
Expected: FAIL with "Cannot find module './relativeTimeScheduler'".

- [ ] **Step 3: Write `relativeTimeScheduler.ts`**

```ts
// A single shared timer for every mounted RelativeTime instance, mirroring
// @github/relative-time-element's dateObserver singleton -- one setTimeout
// for the whole app instead of one per element, which matters when a page
// renders many timestamps at once (e.g. a comment list).

interface Listener {
  getNextDelayMs: () => number;
  onTick: () => void;
}

const listeners = new Set<Listener>();
let timer: ReturnType<typeof setTimeout> | undefined;

function computeMinDelayMs(): number {
  let min = Infinity;
  for (const listener of listeners) {
    min = Math.min(min, listener.getNextDelayMs());
  }
  return min;
}

function tick(): void {
  timer = undefined;
  for (const listener of listeners) {
    listener.onTick();
  }
  reschedule();
}

function reschedule(): void {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
  const minDelayMs = computeMinDelayMs();
  if (!Number.isFinite(minDelayMs)) return;
  timer = setTimeout(tick, minDelayMs);
}

export function scheduleRelativeTimeUpdate(getNextDelayMs: () => number, onTick: () => void): () => void {
  const listener: Listener = { getNextDelayMs, onTick };
  listeners.add(listener);
  reschedule();
  return () => {
    listeners.delete(listener);
    reschedule();
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- relativeTimeScheduler.test`
Expected: PASS (all 6 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/RelativeTime/relativeTimeScheduler.ts packages/ui/src/components/RelativeTime/relativeTimeScheduler.test.ts
git commit -m "feat: add relativeTimeScheduler, a shared timer singleton for RelativeTime"
```

---

## Task 7: `RelativeTime.tsx` — the component

**Files:**
- Create: `packages/ui/src/components/RelativeTime/RelativeTime.tsx`
- Test: `packages/ui/src/components/RelativeTime/RelativeTime.test.tsx`

**Interfaces:**
- Consumes: `computeRelativeTimeText` (Task 4); `scheduleRelativeTimeUpdate` (Task 6); `useDateTimeDefaults` (Task 5); `RelativeTimeProps` (Task 4's `types.ts`).
- Produces: `RelativeTime` component — consumed by Task 8 (barrel exports) and Task 9 (visual tests).

- [ ] **Step 1: Write the failing tests**

```tsx
// packages/ui/src/components/RelativeTime/RelativeTime.test.tsx
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { RelativeTime } from './RelativeTime';
import { DateTimeProvider } from '../../theme/DateTimeProvider';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-04T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RelativeTime', () => {
  it('renders a <time> element with dateTime and a relative text', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" />);
    const time = screen.getByText('3 days ago');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-09-01T12:00:00.000Z');
  });

  it('sets the absolute time as the title attribute', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" timeZone="UTC" />);
    const time = screen.getByText('3 days ago');
    expect(time).toHaveAttribute('title', expect.stringContaining('2026'));
  });

  it('noTitle omits the title attribute', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" noTitle />);
    const time = screen.getByText('3 days ago');
    expect(time).not.toHaveAttribute('title');
  });

  it('accepts a Date object directly', () => {
    render(<RelativeTime date={new Date('2026-09-01T12:00:00Z')} locale="en" />);
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('updates its text as time passes, without a manual re-render', async () => {
    render(<RelativeTime date="2026-09-04T11:59:30Z" locale="en" />);
    expect(screen.getByText('30 seconds ago')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
  });

  it('a format="datetime" instance never registers with the shared scheduler', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" format="datetime" locale="en" timeZone="UTC" />);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('a relative-format instance registers with the shared scheduler and unregisters on unmount', () => {
    const { unmount } = render(<RelativeTime date="2026-09-04T11:59:30Z" locale="en" />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('multiple mounted instances share exactly one timer', () => {
    render(
      <>
        <RelativeTime date="2026-09-04T11:59:30Z" locale="en" />
        <RelativeTime date="2026-09-04T11:00:00Z" locale="en" />
        <RelativeTime date="2026-09-01T12:00:00Z" locale="en" />
      </>,
    );
    expect(vi.getTimerCount()).toBe(1);
  });

  it('reads locale/timeZone/hourCycle from DateTimeProvider when no prop is given', () => {
    render(
      <DateTimeProvider locale="de-DE">
        <RelativeTime date="2026-09-01T12:00:00Z" />
      </DateTimeProvider>,
    );
    expect(screen.getByText('vor 3 Tagen')).toBeInTheDocument();
  });

  it('an explicit prop overrides the DateTimeProvider value', () => {
    render(
      <DateTimeProvider locale="de-DE">
        <RelativeTime date="2026-09-01T12:00:00Z" locale="en" />
      </DateTimeProvider>,
    );
    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('an invalid date renders an empty <time> without throwing', () => {
    render(<RelativeTime date="not-a-date" />);
    const time = document.querySelector('time');
    expect(time).not.toBeNull();
    expect(time!.textContent).toBe('');
  });

  it('forwards className', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" className="custom" />);
    expect(screen.getByText('3 days ago')).toHaveClass('custom');
  });

  it('forwards data-testid', () => {
    render(<RelativeTime date="2026-09-01T12:00:00Z" locale="en" data-testid="my-time" />);
    expect(screen.getByTestId('my-time')).toHaveTextContent('3 days ago');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- RelativeTime.test`
Expected: FAIL with "Cannot find module './RelativeTime'".

- [ ] **Step 3: Write `RelativeTime.tsx`**

```tsx
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

  return (
    <time
      dateTime={date.toISOString()}
      title={noTitle ? undefined : result.title || undefined}
      className={className}
      data-testid={dataTestId}
    >
      {result.text}
    </time>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- RelativeTime.test`
Expected: PASS (all 13 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/RelativeTime/RelativeTime.tsx packages/ui/src/components/RelativeTime/RelativeTime.test.tsx
git commit -m "feat: add RelativeTime component"
```

---

## Task 8: Barrel exports

**Files:**
- Create: `packages/ui/src/components/RelativeTime/index.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: everything from Tasks 2-7.
- Produces: `RelativeTime`, `DateTimeProvider`, `useDateTimeDefaults`, and their types, importable from `@hintoric/ui`.

- [ ] **Step 1: Write `components/RelativeTime/index.ts`**

```ts
export { RelativeTime } from './RelativeTime';
export type {
  RelativeTimeProps,
  RelativeTimeFormatMode,
  RelativeTimeFormatStyle,
  RelativeTimeTense,
  RelativeTimePrecision,
} from './types';
```

- [ ] **Step 2: Append to `packages/ui/src/index.ts`**

Add near the other `theme/`-sourced export (find `export { ColorSchemeProvider }` or similar and add after it; if no such line exists at the point you're editing, add this block at the end of the file instead):

```ts
export { DateTimeProvider, useDateTimeDefaults } from './theme/DateTimeProvider';
export type { DateTimeContextValue, DateTimeProviderProps, HourCycle } from './theme/DateTimeProvider';

export { RelativeTime } from './components/RelativeTime';
export type {
  RelativeTimeProps,
  RelativeTimeFormatMode,
  RelativeTimeFormatStyle,
  RelativeTimeTense,
  RelativeTimePrecision,
} from './components/RelativeTime';
```

- [ ] **Step 3: Verify the full unit test suite still passes**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS (all existing tests plus every RelativeTime/DateTimeProvider test from Tasks 2-7).

- [ ] **Step 4: Verify typecheck passes**

Run from the repo root: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/RelativeTime/index.ts packages/ui/src/index.ts
git commit -m "feat: export RelativeTime and DateTimeProvider from the package's public API"
```

---

## Task 9: Visual regression (self-baseline, per the spec's Section 3)

**Files:**
- Create: `packages/ui/src/visual/RelativeTime.visual.test.tsx`

**Interfaces:**
- Consumes: `RelativeTime` from `../components/RelativeTime`.
- Produces: committed baseline screenshots under `src/visual/__screenshots__/RelativeTime.visual.test.tsx/`.

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { RelativeTime } from '../components/RelativeTime';

// RelativeTime is exempt from this suite's usual "compare against real
// @mui/joy" rule (see docs/superpowers/specs/2026-09-04-relative-time-design.md,
// Section 3): Joy UI has no equivalent component. These are self-baseline
// screenshots only -- toMatchScreenshot() against RelativeTime's own prior
// screenshots, for humans to review typographic regressions even though the
// component's value is primarily text, not a "look" to compare pixel-by-pixel.

const NOW = new Date('2026-09-04T12:00:00Z');

describe('RelativeTime visual (self-baseline)', () => {
  it('relative past matches its own baseline screenshot', async () => {
    render(<RelativeTime date={new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000)} locale="en" data-testid="rt-past" />);
    await expect(page.getByTestId('rt-past')).toMatchScreenshot('relative-time-past');
  });

  it('relative future matches its own baseline screenshot', async () => {
    render(<RelativeTime date={new Date(NOW.getTime() + 5 * 60 * 1000)} locale="en" data-testid="rt-future" />);
    await expect(page.getByTestId('rt-future')).toMatchScreenshot('relative-time-future');
  });

  it('format="datetime" matches its own baseline screenshot', async () => {
    render(
      <RelativeTime
        date={new Date(NOW.getTime() - 60 * 24 * 60 * 60 * 1000)}
        format="datetime"
        locale="en"
        timeZone="UTC"
        data-testid="rt-datetime"
      />,
    );
    await expect(page.getByTestId('rt-datetime')).toMatchScreenshot('relative-time-datetime');
  });

  it('format="micro" matches its own baseline screenshot', async () => {
    render(<RelativeTime date={new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000)} format="micro" locale="en" data-testid="rt-micro" />);
    await expect(page.getByTestId('rt-micro')).toMatchScreenshot('relative-time-micro');
  });
});
```

`RelativeTime` already forwards `data-testid` to the rendered `<time>` element (Task 7), so `page.getByTestId(...)` above resolves directly against real markup — no changes to the component are needed for this task.

- [ ] **Step 2: Run the test once to create baselines (expected to "fail" on purpose)**

Run: `pnpm --filter @hintoric/ui test:visual -- RelativeTime`
Expected: fails with "no existing reference screenshot found" messages -- documented first-run behavior for every visual test in this repo.

- [ ] **Step 3: Run again to confirm baselines now pass**

Run: `pnpm --filter @hintoric/ui test:visual -- RelativeTime`
Expected: PASS. If it still shows baseline-creation messages, run once more (documented environmental quirk in this repo).

- [ ] **Step 4: Open the new screenshots and look at them**

Open the PNGs under `packages/ui/src/visual/__screenshots__/RelativeTime.visual.test.tsx/` and confirm each renders the expected text ("3 days ago", "in 5 minutes", an absolute date string, "3d ago") in the surrounding typography.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/visual/RelativeTime.visual.test.tsx packages/ui/src/visual/__screenshots__/RelativeTime.visual.test.tsx/
git commit -m "test: add RelativeTime self-baseline visual regression coverage"
```

---

## Task 10: Roadmap page

**Files:**
- Modify: `apps/docs/src/pages/RoadmapPage.tsx`

- [ ] **Step 1: Add entries**

In the `'Data display'` group's `items` array, add (next to `Table`/`DataGrid`):

```ts
{ name: 'RelativeTime', done: true },
```

And add a new small group (or extend an existing one) noting the provider:

```ts
{ name: 'DateTimeProvider', done: true },
```

(Add both to the `'Data display'` group's list, next to the `DataGrid` entry, matching how `ColorSchemeProvider` sits in `'Layout & utils'` alongside the components it supports.)

- [ ] **Step 2: Verify the docs app still builds**

Run: `pnpm --filter docs build`
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/pages/RoadmapPage.tsx
git commit -m "docs: mark RelativeTime and DateTimeProvider as done on the roadmap"
```

---

## Task 11: Final full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full jsdom unit test suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS, including every test from Tasks 2-9.

- [ ] **Step 2: Run the full visual regression suite**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS (no regressions in any other component's baselines).

- [ ] **Step 3: Run typecheck**

Run from the repo root: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 4: Run lint**

Run from the repo root: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Run the library build**

Run: `pnpm --filter @hintoric/ui build`
Expected: builds `dist/index.js` + `dist/style.css` without errors.

- [ ] **Step 6: Manual smoke check**

Add a temporary `<RelativeTime date={new Date(Date.now() - 60_000)} />` to the docs app's Home page or playground app, start the dev server, and confirm in a browser that: the text reads "1 minute ago", hovering shows the absolute time in a native tooltip, and the text updates on its own after waiting a minute (no page interaction). Remove the temporary usage afterward unless the user asks to keep it as a permanent docs page (a dedicated `RelativeTimePage.tsx` following the `DataGridPage.tsx` pattern would be a natural follow-up, but is not part of this plan).
