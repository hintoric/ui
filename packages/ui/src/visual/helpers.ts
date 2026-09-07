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

export const COLOR_SCHEMES = ['light', 'dark'] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

/**
 * Puts the whole document into `mode`.
 *
 * On <html>, deliberately, rather than on a wrapper element: Menu, Modal,
 * Drawer, Tooltip, Snackbar, Select and Autocomplete render their popup into a
 * portal on <body>, which no wrapper contains. A wrapper scope leaves those
 * popups light inside a dark test, silently — see darkMode.tsx, which takes
 * the wrapper approach for a different job and documents the same caveat.
 *
 * Both attributes are set because the two token systems use different ones:
 * ours reads `[data-color-scheme]` (theme.css), Joy's generated stylesheet
 * reads `[data-joy-color-scheme]`.
 *
 * Awaits settleTransitions(): `transition-colors` is on every interactive
 * component, so a getComputedStyle() immediately after the flip reads a value
 * mid-transition rather than the final one.
 */
export async function setColorScheme(mode: ColorScheme): Promise<void> {
  document.documentElement.setAttribute('data-color-scheme', mode);
  document.documentElement.setAttribute('data-joy-color-scheme', mode);

  /*
   * Dark mode needs a painted page background, or a screenshot of any
   * transparent element (`plain`/`outlined` variants) is dark text on a white
   * page and no human can review it.
   *
   * Light mode must NOT get one, and this asymmetry is deliberate. The 1248
   * existing light baselines were taken over a *transparent* page, and
   * "transparent" is not "white" for anything semi-transparent composited on
   * top of it: painting the body white shifted ModalOverflow's scrim from
   * rgb(58,58,58) to rgb(110,110,110) and changed 93% of that baseline's
   * pixels. Discovered by the no-modified-light-baseline gate, which is why
   * that gate exists.
   */
  document.body.style.background = mode === 'dark' ? 'var(--color-canvas)' : '';

  await settleTransitions();
}
