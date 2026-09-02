import { describe, expect, it } from 'vitest';
import { asRenderProp } from './asRenderProp';

describe('asRenderProp', () => {
  it('returns undefined when no component is given', () => {
    expect(asRenderProp(undefined)).toBeUndefined();
  });

  it('creates a React element of the given tag name', () => {
    const element = asRenderProp('section');
    expect(element?.type).toBe('section');
  });
});
