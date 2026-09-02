import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cx('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('resolves conflicting Tailwind classes, keeping the last one', () => {
    expect(cx('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });
});
