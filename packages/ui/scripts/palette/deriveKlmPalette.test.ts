import { describe, expect, it } from 'vitest';
import { joyPalette, lightPalette } from '../../src/styles/palette';
import { contrastRatio, hexToOklch } from './color';
import { KLM_V47, deriveLightPalette, deriveNeutral, statusPairs } from './deriveKlmPalette';

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

describe('deriveKlmPalette', () => {
  it('derives the neutral scale pinned in the spec', () => {
    expect(deriveNeutral()).toEqual({
      50: '#FBF7F3',
      100: '#F5F1ED',
      200: '#EBE2DB',
      300: '#D4CCC6',
      400: '#AAA49E',
      500: '#6E6966',
      600: '#605C5A',
      700: '#393735',
      800: '#1A1918',
      900: '#0D0C0C',
    });
  });

  it.each([
    ['danger', 'red'],
    ['success', 'green'],
    ['warning', 'orange'],
  ] as const)('%s keeps KLM fills and darkens text stops only as far as contrast needs', (color, klm) => {
    const p = deriveLightPalette()[color];
    for (const s of [50, 100, 200, 300] as const) expect(p[s]).toBe(KLM_V47[klm][s].toUpperCase());
    for (const s of [400, 500, 600, 700, 800, 900] as const) {
      expect(Math.abs(hexToOklch(p[s]).h - hexToOklch(KLM_V47[klm][s]).h)).toBeLessThan(2);
      expect(hexToOklch(p[s]).l).toBeLessThanOrEqual(hexToOklch(KLM_V47[klm][s]).l + 1e-9);
    }
    STOPS.slice(1).forEach((s, i) => expect(hexToOklch(p[s]).l).toBeLessThan(hexToOklch(p[STOPS[i]]).l));
    for (const pair of statusPairs(p)) {
      expect(contrastRatio(pair.text, pair.bg), pair.label).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('palette.ts records exactly what the script derives', () => {
    const { primary, ...rest } = lightPalette;
    expect(rest).toEqual(deriveLightPalette());
    expect(primary).toEqual(joyPalette.primary);
  });

  it('computes WCAG contrast', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#A3680C', '#F5F1ED')).toBeCloseTo(4.11, 2);
  });
});
