import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { joyPalette, lightPalette } from '../../ui/src/styles/palette.ts';
import { JOY_NEUTRAL, WARM_NEUTRAL, colours, isCoolNeutral, parseColour, warmLight, warmNeutral } from './warm.ts';

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const hex = (rgb: readonly number[]) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('');

describe('warmNeutral', () => {
  it('copies both ramps from @hintoric/ui', () => {
    expect(JOY_NEUTRAL).toEqual(STOPS.map((s) => joyPalette.neutral[s]));
    expect(WARM_NEUTRAL).toEqual(STOPS.map((s) => lightPalette.neutral[s]));
  });

  it("lands every Joy neutral stop exactly on the warm stop of the same number", () => {
    expect(JOY_NEUTRAL.map((h) => hex(warmNeutral(parseColour(h))))).toEqual(WARM_NEUTRAL);
  });

  it('keeps white, black and every accent of the set', () => {
    for (const keep of ['#FFFFFF', '#000000', '#1296FC', '#06D272', '#FEBD2D', '#F9CABF', '#FA918C', '#C3C6F0', '#ACB2F8']) {
      expect(hex(warmNeutral(parseColour(keep)))).toBe(keep);
    }
  });

  it('turns the lavender sheet and the charcoal ink warm', () => {
    expect(warmNeutral([232, 234, 243])).toEqual([239, 231, 226]);
    expect(warmNeutral([41, 42, 43])).toEqual([43, 42, 40]);
    expect(isCoolNeutral([232, 234, 243])).toBe(true);
    expect(isCoolNeutral([239, 231, 226])).toBe(false);
  });
});

describe('warmLight', () => {
  it("keeps each literal's notation and leaves accents alone", () => {
    expect(warmLight('<path fill="#E8EAF3"/><path fill="#e8eaf3"/><path fill="rgb(232, 234, 243)"/><path fill="rgb(232,234,243)"/>')).toBe(
      '<path fill="#EFE7E2"/><path fill="#efe7e2"/><path fill="rgb(239, 231, 226)"/><path fill="rgb(239,231,226)"/>',
    );
    expect(warmLight('<path fill="#1296fc" stroke="#fff"/>')).toBe('<path fill="#1296fc" stroke="#fff"/>');
  });
});

// The light scheme's page is warm beige (bg-canvas, neutral-100); a cool grey in a light
// illustration reads as a cold patch on it. New icons from Recraft come in cool greys:
// run `node scripts/warm.ts svg/<slug>/light.svg` and upload the result to the CDN.
describe('svg/*/light.svg', () => {
  const root = join(import.meta.dirname, '..', 'svg');
  const slugs = readdirSync(root).filter((s) => existsSync(join(root, s, 'light.svg')));

  it.each(slugs)('%s uses warm neutrals only', (slug) => {
    const cool = colours(readFileSync(join(root, slug, 'light.svg'), 'utf8')).filter((c) => isCoolNeutral(parseColour(c)));
    expect(cool).toEqual([]);
  });
});
