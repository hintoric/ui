import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseThemeCss, resolveToken } from './themeCss';
import { joyPalette, lightPalette, radius } from '../../src/styles/palette';

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

const { light, dark } = parseThemeCss(readFileSync(resolve(import.meta.dirname, '../../src/styles/theme.css'), 'utf8'));
const r = (name: string) => resolveToken(light, name);

// The spec this checks: docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md.
describe('theme.css', () => {
  it('uses the palette.ts stops: derived in light, Joy in dark', () => {
    for (const c of COLORS) for (const s of STOPS) expect(light[`--color-${c}-${s}`].toUpperCase()).toBe(lightPalette[c][s]);
    for (const c of ['neutral', 'danger', 'success', 'warning'] as const)
      for (const s of STOPS) expect(dark[`--color-${c}-${s}`]?.toUpperCase(), `dark --color-${c}-${s}`).toBe(joyPalette[c][s]);
  });

  it('has the new shape: radius scale, 1.5px outlines, flat resting surfaces', () => {
    for (const [k, v] of Object.entries(radius)) expect(light[`--radius-${k}`]).toBe(v);
    expect(light['--default-border-width']).toBe('1.5px');
    expect(light['--shadow-xs']).toBe('none');
    expect(dark['--shadow-xs']).toBe('none');
    expect(light['--shadow-md']).toBe('0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 6px 12px -2px rgba(21, 21, 21, 0.08)');
    expect(light['--shadow-lg']).toBe('0px 2px 8px -2px rgba(21, 21, 21, 0.08), 0px 12px 16px -4px rgba(21, 21, 21, 0.08)');
    expect(dark['--shadow-md']).toBe('0px 2px 8px -2px rgba(0, 0, 0, 0.6), 0px 6px 12px -2px rgba(0, 0, 0, 0.6)');
    expect(dark['--shadow-lg']).toBe('0px 2px 8px -2px rgba(0, 0, 0, 0.6), 0px 12px 16px -4px rgba(0, 0, 0, 0.6)');
  });

  it('puts white surfaces on a warm canvas in light', () => {
    expect(r('--color-canvas')).toBe('#F5F1ED');
    expect(r('--color-surface')).toBe('#FFFFFF');
    expect(r('--color-surface-popup')).toBe('#FFFFFF');
    expect([r('--color-surface-1'), r('--color-surface-2'), r('--color-surface-3')]).toEqual(['#EBE2DB', '#D4CCC6', '#AAA49E']);
    expect(light['--color-divider']).toBe('rgba(110, 105, 102, 0.2)');
    // A borderless white Card is only visible because these differ.
    expect(r('--color-canvas')).not.toBe(r('--color-surface'));
  });

  it('moves neutral fills one stop darker in light', () => {
    expect(r('--color-neutral-soft-bg')).toBe('#EBE2DB');
    expect(r('--color-neutral-soft-hover-bg')).toBe('#D4CCC6');
    expect(r('--color-neutral-soft-active-bg')).toBe('#AAA49E');
    for (const v of ['plain', 'outlined']) {
      expect(r(`--color-neutral-${v}-hover-bg`)).toBe('#EBE2DB');
      expect(r(`--color-neutral-${v}-active-bg`)).toBe('#D4CCC6');
    }
    for (const c of COLORS) expect(r(`--color-${c}-solid-disabled-bg`)).toBe('#EBE2DB');
  });

  it('gives nothing that should show a fill the canvas colour', () => {
    const fills = Object.keys(light).filter(
      (n) => (/^--color-neutral-.*-bg$/.test(n) || /-solid-disabled-bg$/.test(n)) && !/soft-disabled-bg$/.test(n),
    );
    expect(fills.length).toBeGreaterThan(10);
    for (const name of fills) expect(r(name), name).not.toBe('#F5F1ED');
  });

  it('redeclares in dark everything built on a raw stop that changed', () => {
    // A dark scheme set on an inner element inherits :root's already-resolved
    // values for anything the dark block doesn't redeclare — warm, there.
    for (const [name, value] of Object.entries(light)) {
      if (name.startsWith('--color-') && /var\(--color-(neutral|danger|success|warning)-\d+\)/.test(value)) {
        expect(dark, name).toHaveProperty([name]);
      }
    }
  });
});
