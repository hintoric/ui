/**
 * Moves the neutrals of a light-scheme illustration from Joy's cool blue-grey
 * ramp onto @hintoric/ui's warm light ramp (`lightPalette.neutral` in
 * packages/ui/src/styles/palette.ts). Recraft draws the light variants in cool
 * greys and lavender tints; the light scheme's page is a warm beige, where
 * those read as a cold patch.
 *
 * A colour counts as a neutral when its OKLCH chroma is below NEUTRAL_CHROMA:
 * every accent the set uses — blue, green, yellow, the coral cheeks (0.056),
 * the periwinkle text lines (0.059 and up) — sits above it and is kept. A
 * neutral keeps its place on the ramp: its OKLab lightness is located on Joy's
 * ramp, and it becomes the warm colour at the same position, so Joy's stop N
 * lands exactly on the warm stop N and a shade between two stops lands between
 * them. White and black are the ramp's ends, so the white sticker outline stays
 * white. Dark variants are not touched: the dark scheme keeps Joy's palette.
 *
 *   node scripts/warm.ts svg/<slug>/light.svg …   # rewrites the files in place
 *
 * Then upload the result to the CDN (cdn:icons/<slug>/light.svg), which is what
 * `pnpm sync` mirrors.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

type Rgb = readonly [number, number, number];
type Lab = readonly [number, number, number];

/** Joy's neutral 50…900 — what the illustrations were drawn against. */
export const JOY_NEUTRAL = ['#FBFCFE', '#F0F4F8', '#DDE7EE', '#CDD7E1', '#9FA6AD', '#636B74', '#555E68', '#32383E', '#171A1C', '#0B0D0E'];
/** `lightPalette.neutral` 50…900 of @hintoric/ui; warm.test.ts checks the copy. */
export const WARM_NEUTRAL = ['#FBF7F3', '#F5F1ED', '#EBE2DB', '#D4CCC6', '#AAA49E', '#6E6966', '#605C5A', '#393735', '#1A1918', '#0D0C0C'];
export const NEUTRAL_CHROMA = 0.045;

/** Every colour literal Recraft and hand-drawn icons use: #rgb, #rrggbb, rgb(r, g, b). */
const COLOUR = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;

export function parseColour(token: string): Rgb {
  if (token.startsWith('#')) {
    const h = token.length === 4 ? [...token.slice(1)].map((c) => c + c).join('') : token.slice(1);
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as unknown as Rgb;
  }
  return token.match(/\d+/g)!.map(Number) as unknown as Rgb;
}

const toLinear = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => {
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(s * 255)));
};

export function toOklab([r8, g8, b8]: Rgb): Lab {
  const [r, g, b] = [r8, g8, b8].map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function fromOklab([L, a, b]: Lab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

/** OKLCH chroma and hue (degrees). */
export function chromaHue(rgb: Rgb): { chroma: number; hue: number } {
  const [, a, b] = toOklab(rgb);
  return { chroma: Math.hypot(a, b), hue: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
}

const joyL = [1, ...JOY_NEUTRAL.map((h) => toOklab(parseColour(h))[0]), 0];
const warmLab: Lab[] = [[1, 0, 0], ...WARM_NEUTRAL.map((h) => toOklab(parseColour(h))), [0, 0, 0]];

/** The warm colour at the same ramp position, or the colour itself when it is not a neutral. */
export function warmNeutral(rgb: Rgb): Rgb {
  if (chromaHue(rgb).chroma >= NEUTRAL_CHROMA) return rgb;
  const L = toOklab(rgb)[0];
  for (let i = 0; i < joyL.length - 1; i++) {
    const [hi, lo] = [joyL[i]!, joyL[i + 1]!];
    if (L <= hi && L >= lo) {
      const t = hi === lo ? 0 : (hi - L) / (hi - lo);
      const [a, b] = [warmLab[i]!, warmLab[i + 1]!];
      return fromOklab([0, 1, 2].map((k) => a[k]! + (b[k]! - a[k]!) * t) as unknown as Lab);
    }
  }
  throw new Error(`rgb(${rgb.join(', ')}) is outside the ramp`);
}

/** True for a neutral with a blue-to-violet cast, or one of Joy's neutral stops. */
export function isCoolNeutral(rgb: Rgb): boolean {
  const { chroma, hue } = chromaHue(rgb);
  const joy = JOY_NEUTRAL.some((h) => parseColour(h).every((v, i) => v === rgb[i]));
  return joy || (chroma < NEUTRAL_CHROMA && chroma > 0.002 && hue >= 180 && hue <= 330);
}

export function colours(svg: string): string[] {
  return [...new Set(svg.match(COLOUR) ?? [])];
}

/** Rewrites every neutral in `svg`, keeping each literal's notation (hex case, rgb() spacing). */
export function warmLight(svg: string): string {
  return svg.replace(COLOUR, (token) => {
    const from = parseColour(token);
    const to = warmNeutral(from);
    if (to.every((v, i) => v === from[i])) return token;
    if (token.startsWith('#')) {
      const hex = '#' + to.map((v) => v.toString(16).padStart(2, '0')).join('');
      return /[A-F]/.test(token) ? hex.toUpperCase() : hex;
    }
    return `rgb(${to.join(token.includes(', ') ? ', ' : ',')})`;
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('usage: node scripts/warm.ts <light.svg> …');
    process.exit(1);
  }
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    const after = warmLight(before);
    writeFileSync(file, after);
    const changed = colours(before).filter((c) => !after.includes(c)).length;
    console.log(`${file}: ${changed} colour(s) warmed`);
  }
}
