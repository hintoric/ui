import { describe, expect, it } from 'vitest';
import {
  INTERACTIVE_COLOR_CLASSES,
  SURFACE_COLOR_CLASSES,
  INPUT_COLOR_CLASSES,
  STATIC_COLOR_CLASSES,
  type JoyColor,
  type JoyVariant,
} from './colorVariantClasses';

const VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];
const MAPS = { INTERACTIVE_COLOR_CLASSES, SURFACE_COLOR_CLASSES, INPUT_COLOR_CLASSES, STATIC_COLOR_CLASSES };

describe('colorVariantClasses', () => {
  it('defines all four variants for every map', () => {
    for (const map of Object.values(MAPS)) {
      expect(Object.keys(map)).toEqual(VARIANTS);
    }
  });

  it('defines all five colors under every variant of every map', () => {
    for (const map of Object.values(MAPS)) {
      for (const variant of VARIANTS) {
        expect(Object.keys(map[variant])).toEqual(COLORS);
      }
    }
  });

  it('produces the exact class string Button relies on for solid/primary', () => {
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

  it('gives Sheet/Card a surface background for outlined/plain instead of transparent', () => {
    expect(SURFACE_COLOR_CLASSES.outlined.neutral).toContain('bg-surface');
    expect(SURFACE_COLOR_CLASSES.plain.neutral).toContain('bg-surface');
  });

  it('keeps Input classes free of hover/active pseudo-classes (Joy UI disables hover fill for Input)', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(INPUT_COLOR_CLASSES[variant][color]).not.toMatch(/hover:|active:/);
      }
    }
  });

  it('gives Input a surface background for outlined/plain instead of transparent', () => {
    expect(INPUT_COLOR_CLASSES.outlined.neutral).toContain('bg-surface');
    expect(INPUT_COLOR_CLASSES.plain.neutral).toContain('bg-surface');
  });

  it('keeps static classes free of hover/active/disabled pseudo-classes', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(STATIC_COLOR_CLASSES[variant][color]).not.toMatch(/hover:|active:|disabled:/);
      }
    }
  });

  it('gives Avatar a transparent background for outlined/plain, unlike Sheet/Card/Input', () => {
    expect(STATIC_COLOR_CLASSES.outlined.neutral).toContain('bg-transparent');
    expect(STATIC_COLOR_CLASSES.plain.neutral).toContain('bg-transparent');
  });
});
