/*
 * The colour maths the palette derivation and the theme contrast test share:
 * hex <-> OKLCH (Björn Ottosson's OKLab, sRGB D65) and WCAG 2.x contrast.
 */

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a #RRGGBB colour: ${hex}`);
  return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(a, bb), h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360 };
}

/** Linear sRGB channels for an OKLCH colour, unclamped (may fall outside 0..1). */
function oklchToLinearRgb({ l: L, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb: number[]) => rgb.every((x) => x >= -1e-6 && x <= 1 + 1e-6);

/**
 * `#RRGGBB`, uppercase. An out-of-gamut colour keeps its lightness and hue and
 * loses chroma until it fits, rather than having its channels clipped (which
 * would shift the hue).
 */
export function oklchToHex(o: Oklch): string {
  let rgb = oklchToLinearRgb(o);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = o.c;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinearRgb({ ...o, c: mid }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinearRgb({ ...o, c: lo });
  }
  return (
    '#' +
    rgb
      .map((x) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, x))))) * 255))
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1..21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
