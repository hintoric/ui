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
