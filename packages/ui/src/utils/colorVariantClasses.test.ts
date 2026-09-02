import { describe, expect, it } from 'vitest';
import {
  INTERACTIVE_COLOR_CLASSES,
  SURFACE_COLOR_CLASSES,
  type JoyColor,
  type JoyVariant,
} from './colorVariantClasses';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

describe('colorVariantClasses', () => {
  it('defines all four variants for the interactive map', () => {
    expect(Object.keys(INTERACTIVE_COLOR_CLASSES)).toEqual(VARIANTS);
  });

  it('defines all five colors under every variant of both maps', () => {
    for (const variant of VARIANTS) {
      expect(Object.keys(INTERACTIVE_COLOR_CLASSES[variant])).toEqual(COLORS);
      expect(Object.keys(SURFACE_COLOR_CLASSES[variant])).toEqual(COLORS);
    }
  });

  it('produces the exact class string Button/Input rely on for solid/primary', () => {
    expect(INTERACTIVE_COLOR_CLASSES.solid.primary).toBe(
      'bg-primary-solid-bg text-primary-solid-color hover:bg-primary-solid-hover-bg active:bg-primary-solid-active-bg disabled:bg-primary-solid-disabled-bg disabled:text-primary-solid-disabled-color',
    );
  });

  it('keeps surface classes free of hover/active/disabled pseudo-classes', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(SURFACE_COLOR_CLASSES[variant][color]).not.toMatch(/hover:|active:|disabled:/);
      }
    }
  });
});
