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
