/*
 * Derives the light palette of the KLM-inspired look from KLM's component
 * library v47.0.0 (klm.de's `kl.css`), by the rules in
 * docs/superpowers/specs/2026-10-27-klm-inspired-look-design.md:
 *
 * - neutral: 50–300 are KLM's own stops; 400–900 keep Joy's OKLCH lightness
 *   (so text and icon contrast stays where Joy had it) and take KLM's warm hue
 *   and chroma at that lightness.
 * - danger/success/warning ← KLM red/green/orange: 50–400 are KLM's own stops;
 *   500–900 keep KLM's hue and chroma and lose only as much lightness as it
 *   takes for every text/background pair the variant formula produces to reach
 *   4.5:1.
 *
 * `src/styles/palette.ts` records the result; this file's test fails when the
 * two disagree. Run it to print the palette and its contrast table:
 *
 *   node packages/ui/scripts/palette/deriveKlmPalette.ts
 */
import { pathToFileURL } from 'node:url';
import { joyPalette, type Stop } from '../../src/styles/palette.ts';
import { contrastRatio, hexToOklch, oklchToHex } from './color.ts';

type KlmStop = Stop | 950;

export const KLM_V47: Record<'neutral' | 'red' | 'green' | 'orange', Record<KlmStop, string>> = {
  neutral: { 50: '#fbf7f3', 100: '#f5f1ed', 200: '#ebe2db', 300: '#d4ccc6', 400: '#bab3ad', 500: '#99948f', 600: '#797471', 700: '#565250', 800: '#3e3b3a', 900: '#272524', 950: '#161514' },
  red: { 50: '#ffeef6', 100: '#ffd9e3', 200: '#febec6', 300: '#fd989e', 400: '#fc6063', 500: '#d42a1e', 600: '#a02118', 700: '#751811', 800: '#4c100b', 900: '#2a0906', 950: '#160302' },
  green: { 50: '#dafada', 100: '#b7f1ba', 200: '#99dea6', 300: '#73c58b', 400: '#40a469', 500: '#287d52', 600: '#1c5d47', 700: '#0f433a', 800: '#0a2b26', 900: '#051714', 950: '#020a09' },
  orange: { 50: '#fdefd9', 100: '#fce0b2', 200: '#f9c674', 300: '#f5a31e', 400: '#ca8312', 500: '#a3680c', 600: '#764905', 700: '#583400', 800: '#382100', 900: '#1d1200', 950: '#0c0700' },
};

const STOPS: Stop[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const CANVAS = '#F5F1ED';
const WHITE = '#FFFFFF';
/*
 * Darkening 500 for contrast can push it onto KLM's own 600 (warning: #7D4E00
 * against #764905), and 600/700 are solid's hover and active fills — a hover
 * nobody can see. So every stop from 600 on also sits at least this much
 * OKLCH lightness below the one before it. Joy's own primary steps by
 * 0.05 (500→600) and 0.09 (600→700).
 */
const MIN_STEP = 0.04;

export function deriveNeutral(): Record<Stop, string> {
  const klm = Object.values(KLM_V47.neutral)
    .map(hexToOklch)
    .sort((a, b) => a.l - b.l);
  const at = (l: number) => {
    if (l <= klm[0].l) return { c: klm[0].c, h: klm[0].h };
    for (let i = 1; i < klm.length; i++) {
      if (l <= klm[i].l) {
        const t = (l - klm[i - 1].l) / (klm[i].l - klm[i - 1].l);
        return { c: klm[i - 1].c + t * (klm[i].c - klm[i - 1].c), h: klm[i - 1].h + t * (klm[i].h - klm[i - 1].h) };
      }
    }
    const last = klm[klm.length - 1];
    return { c: last.c, h: last.h };
  };
  const out = {} as Record<Stop, string>;
  for (const s of STOPS) {
    if (s <= 300) {
      out[s] = KLM_V47.neutral[s].toUpperCase();
    } else {
      const { l } = hexToOklch(joyPalette.neutral[s]);
      out[s] = oklchToHex({ l, ...at(l) });
    }
  }
  return out;
}

/**
 * The text/background pairs the light variant formula builds from one status
 * palette (theme.css: plain/outlined text is 500 on the page, on white, and on
 * its 100/200 hover/active fills; soft text is 700 on 100/200 and 800 on 300;
 * solid is white on 500/600/700). `stops` names the palette stops a pair uses.
 */
export function statusPairs(p: Record<Stop, string>): Array<{ label: string; text: string; bg: string; stops: Stop[] }> {
  return [
    { label: '500 on canvas', text: p[500], bg: CANVAS, stops: [500] },
    { label: '500 on white', text: p[500], bg: WHITE, stops: [500] },
    { label: '500 on 100', text: p[500], bg: p[100], stops: [500, 100] },
    { label: '500 on 200', text: p[500], bg: p[200], stops: [500, 200] },
    { label: '700 on 100', text: p[700], bg: p[100], stops: [700, 100] },
    { label: '700 on 200', text: p[700], bg: p[200], stops: [700, 200] },
    { label: '800 on 300', text: p[800], bg: p[300], stops: [800, 300] },
    { label: 'white on 500', text: WHITE, bg: p[500], stops: [500] },
    { label: 'white on 600', text: WHITE, bg: p[600], stops: [600] },
    { label: 'white on 700', text: WHITE, bg: p[700], stops: [700] },
  ];
}

export function deriveStatus(source: Record<KlmStop, string>): Record<Stop, string> {
  const out = {} as Record<Stop, string>;
  for (const s of STOPS) out[s] = source[s].toUpperCase();
  let previous = hexToOklch(out[400]).l;
  for (const s of [500, 600, 700, 800, 900] as const) {
    const { l: start, c, h } = hexToOklch(source[s]);
    // Only pairs whose darkest stop is this one: later stops are still KLM's
    // and get settled on their own turn.
    const settles = (p: Record<Stop, string>) =>
      statusPairs(p)
        .filter((pair) => Math.max(...pair.stops) === s)
        .every((pair) => contrastRatio(pair.text, pair.bg) >= 4.5);
    const ceiling = s === 500 ? previous : previous - MIN_STEP;
    for (let l = start; l > 0; l -= 0.002) {
      out[s] = oklchToHex({ l, c, h });
      if (hexToOklch(out[s]).l < ceiling && settles(out)) break;
    }
    previous = hexToOklch(out[s]).l;
  }
  return out;
}

export function deriveLightPalette(): Record<'neutral' | 'danger' | 'success' | 'warning', Record<Stop, string>> {
  return {
    neutral: deriveNeutral(),
    danger: deriveStatus(KLM_V47.red),
    success: deriveStatus(KLM_V47.green),
    warning: deriveStatus(KLM_V47.orange),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const palette = deriveLightPalette();
  const literal = (stops: Record<Stop, string>) => `{ ${STOPS.map((s) => `${s}: '${stops[s]}'`).join(', ')} }`;
  console.log('// lightPalette (paste into src/styles/palette.ts)');
  for (const [name, stops] of Object.entries(palette)) console.log(`  ${name}: ${literal(stops)},`);
  console.log('\n| Colour | Pair | Ratio |\n|---|---|---|');
  for (const name of ['danger', 'success', 'warning'] as const) {
    for (const pair of statusPairs(palette[name])) {
      console.log(`| ${name} | ${pair.label} (${pair.text} on ${pair.bg}) | ${contrastRatio(pair.text, pair.bg).toFixed(2)} |`);
    }
  }
}
