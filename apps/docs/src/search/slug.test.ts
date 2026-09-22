import { describe, expect, it } from 'vitest';
import { slug } from './slug.ts';

describe('slug', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slug('Basic usage')).toBe('basic-usage');
  });

  it('drops punctuation rather than encoding it', () => {
    expect(slug('Variants & colors')).toBe('variants-colors');
    expect(slug('Moving it from a stylesheet')).toBe('moving-it-from-a-stylesheet');
  });

  it('collapses runs of separators and trims the ends', () => {
    expect(slug('  The bar ‒‒ and the pill  ')).toBe('the-bar-and-the-pill');
  });
});
