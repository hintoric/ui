import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../scripts/palette/color';
import { parseThemeCss, resolveToken } from '../../scripts/palette/themeCss';

const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

const { light } = parseThemeCss(readFileSync(resolve(import.meta.dirname, 'theme.css'), 'utf8'));
const r = (name: string) => resolveToken(light, name);

/*
 * Every light text/background pair the variant formula produces, in every
 * state, reaches WCAG AA (4.5:1). Primary's plain and outlined text on its
 * active fill is the one exception: primary is unchanged from Joy, and Joy
 * puts it at 3.85:1 — those two are held at that value so they can't get
 * worse. See the spec's "Colour — light scheme".
 */
const EXCEPTIONS: Record<string, number> = {
  '--color-primary-plain-color on --color-primary-plain-active-bg': 3.85,
  '--color-primary-outlined-color on --color-primary-outlined-active-bg': 3.85,
};

function pairs(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const c of COLORS) {
    for (const v of ['plain', 'outlined']) {
      for (const bg of ['--color-canvas', '--color-surface', `--color-${c}-${v}-hover-bg`, `--color-${c}-${v}-active-bg`]) {
        out.push([`--color-${c}-${v}-color`, bg]);
      }
    }
    out.push([`--color-${c}-soft-color`, `--color-${c}-soft-bg`]);
    out.push([`--color-${c}-soft-color`, `--color-${c}-soft-hover-bg`]);
    out.push([`--color-${c}-soft-active-color`, `--color-${c}-soft-active-bg`]);
    for (const bg of ['bg', 'hover-bg', 'active-bg']) out.push([`--color-${c}-solid-color`, `--color-${c}-solid-${bg}`]);
    out.push([`--color-${c}-main`, '--color-canvas'], [`--color-${c}-main`, '--color-surface']);
  }
  out.push(['--color-neutral-plain-hover-color', '--color-neutral-plain-hover-bg']);
  for (const ink of ['primary', 'secondary', 'tertiary']) {
    out.push([`--color-ink-${ink}`, '--color-canvas'], [`--color-ink-${ink}`, '--color-surface']);
  }
  return out;
}

describe('theme.css light contrast', () => {
  it.each(pairs())('%s on %s', (text, bg) => {
    const ratio = contrastRatio(r(text), r(bg));
    const exception = EXCEPTIONS[`${text} on ${bg}`];
    if (exception !== undefined) expect(ratio).toBeCloseTo(exception, 2);
    else expect(ratio, `${r(text)} on ${r(bg)}`).toBeGreaterThanOrEqual(4.5);
  });
});
