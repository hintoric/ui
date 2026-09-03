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
