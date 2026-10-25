import { describe, expect, it } from 'vitest';
import { applySlotColors, cdnSources } from './slots';

const DARK = [0.1, 0.2, 0.3, 1];

function animation() {
  return {
    v: '5.12.0',
    slots: {
      sticker: { p: { a: 0, k: [1, 1, 1, 1] } },
      accent: { p: { a: 0, k: [0, 0.5, 1, 1] } },
    },
    layers: [
      {
        shapes: [
          { ty: 'fl', c: { a: 0, k: [1, 1, 1, 1], sid: 'sticker' } },
          {
            ty: 'gr',
            it: [
              { ty: 'st', c: { a: 0, k: [0, 0.5, 1, 1], sid: 'accent' } },
              {
                ty: 'fl',
                c: { a: 1, k: [{ t: 0, s: [1, 1, 1, 1] }, { t: 60, s: [0, 0, 0, 1] }], sid: 'sticker' },
              },
            ],
          },
        ],
      },
    ],
  };
}

describe('applySlotColors', () => {
  it('overwrites the slot table and every property carrying that sid', () => {
    const result = applySlotColors(animation(), { sticker: DARK });
    expect(result.slots.sticker).toEqual({ p: { a: 0, k: DARK } });
    expect(result.layers[0].shapes[0].c).toEqual({ a: 0, k: DARK, sid: 'sticker' });
  });

  it('turns an animated property with that sid into the static slot colour', () => {
    const result = applySlotColors(animation(), { sticker: DARK });
    expect(result.layers[0].shapes[1].it![1].c).toEqual({ a: 0, k: DARK, sid: 'sticker' });
  });

  it('leaves slots it was not given alone', () => {
    const result = applySlotColors(animation(), { sticker: DARK });
    expect(result.slots.accent).toEqual({ p: { a: 0, k: [0, 0.5, 1, 1] } });
    expect(result.layers[0].shapes[1].it![0].c).toEqual({ a: 0, k: [0, 0.5, 1, 1], sid: 'accent' });
  });

  it('does not add a slot the file does not declare', () => {
    const result = applySlotColors(animation(), { unknown: DARK });
    expect(result.slots).not.toHaveProperty('unknown');
  });

  it('never mutates its input, and copies even without colours', () => {
    const original = animation();
    const snapshot = structuredClone(original);
    const recoloured = applySlotColors(original, { sticker: DARK, accent: DARK });
    const untouched = applySlotColors(original);
    expect(original).toEqual(snapshot);
    expect(untouched).toEqual(snapshot);
    expect(untouched).not.toBe(original);
    expect(recoloured).not.toBe(original);
  });

  it('works on a file without a slot table (a player without slot support)', () => {
    const { v, layers } = animation();
    const withoutSlots = { v, layers };
    const result = applySlotColors(withoutSlots, { sticker: DARK });
    expect(result).not.toHaveProperty('slots');
    expect(result.layers[0].shapes[0]).toMatchObject({ c: { k: DARK } });
  });
});

describe('cdnSources', () => {
  it('derives every file of an icon from its name', () => {
    expect(cdnSources('form-reading-lens')).toEqual({
      animation: 'https://cdn.hintoric.com/assets/icons/form-reading-lens/form-reading-lens.json',
      darkSlots: 'https://cdn.hintoric.com/assets/icons/form-reading-lens/dark-slots.json',
      light: 'https://cdn.hintoric.com/assets/icons/form-reading-lens/light.svg',
      dark: 'https://cdn.hintoric.com/assets/icons/form-reading-lens/dark.svg',
    });
  });
});
