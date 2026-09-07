export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Every interactive component has `transition-colors` in its class list, which
 * puts `outline-color`/`background-color`/`color`/`border-color` etc. under a
 * CSS transition (~150ms). Reading `getComputedStyle()` synchronously right
 * after `.focus()`/a state change catches the transition mid-flight — an
 * intermediate value, not the final one. Always await this (or an equivalent
 * settle delay) before asserting on computed styles for any state change.
 */
export async function settleTransitions(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));
}

/**
 * Tailwind v4 composes `box-shadow` from several CSS-variable "slots" (inset
 * shadow, inset ring, ring offset, ring, shadow) that are ALWAYS all present
 * in the computed value, defaulting to an invisible `rgba(0,0,0,0) 0 0 0 0`
 * layer when a given slot isn't used by any class on the element. Two
 * elements using a different *number* of shadow-related utility classes end
 * up with a different number of these invisible placeholder layers even when
 * the actual visible shadow is identical — a real @mui/joy element has the
 * same behavior (it also carries one placeholder ring layer), just not
 * necessarily the same count. Compare only the last (real) layer, not the
 * full string.
 */
export function lastShadowLayer(boxShadow: string): string {
  return lastShadowLayers(boxShadow, 1);
}

/**
 * Like {@link lastShadowLayer}, but for shadows with more than one real
 * layer (e.g. `--shadow-md`'s two-layer elevation) — compares the last `n`
 * comma-separated layers instead of just the final one, still ignoring any
 * leading invisible placeholder layers Tailwind adds.
 */
export function lastShadowLayers(boxShadow: string, n: number): string {
  if (boxShadow === 'none') return 'none';
  const layers: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of boxShadow) {
    if (char === '(') depth++;
    if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      layers.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  layers.push(current.trim());
  return layers.slice(-n).join(', ');
}

/**
 * Puts the whole document in `mode` — on <html>, not on a wrapper, so that
 * portalled popups (Menu/Modal/Drawer/Tooltip/Snackbar/Select/Autocomplete)
 * inherit it too. A wrapper element cannot work: Base UI portals mount onto
 * `document.body`, a sibling of any wrapper, so their popups would render
 * light inside a dark test — silently, and in exactly the components where a
 * dark bug is hardest to notice.
 *
 * Both attributes are set because both selectors are attribute-based: ours
 * (`theme.css`) and Joy's (`@mui/system` emits `[data-joy-color-scheme="dark"]`).
 * Joy providers additionally need `defaultMode={scheme}` so Joy's JS-side mode
 * matches its CSS-side mode.
 *
 * Light and dark therefore run sequentially rather than as siblings in one
 * document. Nothing is lost: the pairing this suite needs is Joy-vs-Hintoric,
 * never light-vs-dark.
 *
 * Awaits settleTransitions(): `transition-colors` is on every interactive
 * component, so a synchronous getComputedStyle() right after the flip reads an
 * intermediate value.
 */
export async function setColorScheme(mode: ColorScheme): Promise<void> {
  const root = document.documentElement;
  root.setAttribute('data-color-scheme', mode);
  root.setAttribute('data-joy-color-scheme', mode);
  await settleTransitions();
}


/**
 * Joy expresses line-height as a unitless ratio, so its computed value carries
 * the ratio's rounding: `lineHeight.sm` is 1.42858, and 1.42858 x 14px is
 * 20.00012px, which the browser reports as `20.0001px`. A Tailwind class that
 * states the same design intent lands on a clean `20px`.
 *
 * That 0.0001px is not a divergence anyone can see or should chase, so
 * line-height is the one property compared with a tolerance rather than by
 * string equality. Everything else in this suite stays exact - a loose
 * comparison is how real divergences hide.
 */
export function expectSameLineHeight(ours: string, joy: string): void {
  const a = parseFloat(ours);
  const b = parseFloat(joy);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    // `normal` and other keywords have no numeric value: compare as given.
    if (ours !== joy) {
      throw new Error(`line-height mismatch: ours ${ours}, Joy ${joy}`);
    }
    return;
  }
  if (Math.abs(a - b) > 0.01) {
    throw new Error(`line-height mismatch: ours ${ours}, Joy ${joy}`);
  }
}

/**
 * Waits until a computed value stops changing, rather than guessing a delay.
 *
 * `settleTransitions`' fixed 200ms is enough for most state changes but not all
 * of them under full-suite load: Select's disabled background read as an
 * intermediate colour in roughly one run in three, which looks exactly like a
 * real divergence and is not one. Polling for stability removes the guess.
 *
 * Returns the settled value. Gives up after `timeout` and returns whatever it
 * last saw, so a genuinely animating element still fails its assertion rather
 * than hanging the suite.
 */
export async function settleUntilStable(
  read: () => string,
  { timeout = 2000, stableFor = 100 }: { timeout?: number; stableFor?: number } = {},
): Promise<string> {
  const deadline = Date.now() + timeout;
  let last = read();
  let stableSince = Date.now();

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 25));
    const current = read();
    if (current !== last) {
      last = current;
      stableSince = Date.now();
    } else if (Date.now() - stableSince >= stableFor) {
      return current;
    }
  }
  return last;
}
