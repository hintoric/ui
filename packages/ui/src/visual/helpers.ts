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
  return layers[layers.length - 1];
}
