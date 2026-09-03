// A faithful port of @github/relative-time-element's Duration class and its
// elapsedTime/roundToSingleUnit/getRelativeTimeUnit algorithm
// (MIT licensed, Copyright (c) GitHub, Inc. --
// https://github.com/github/relative-time-element/blob/main/src/duration.ts).
// This calendar-aware rounding (correctly resolving "23 hours" to
// "yesterday", "26 days" to "last month", "11-13 months" to "last year",
// etc.) is exactly the kind of logic worth reusing rather than re-deriving --
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
