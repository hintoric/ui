import type * as React from 'react';

export type AnimatedIconMode = 'auto' | 'light' | 'dark';

/** Where an animated icon's files live. `name` derives all four from the CDN. */
export interface AnimatedIconSources {
  /** The Lottie JSON. Its colours are the light scheme's. */
  animation: string;
  /** `{ slotId: [r, g, b, a] }` (0–1) for the dark scheme. */
  darkSlots: string;
  /** Still image for the light scheme, shown under reduced motion. */
  light: string;
  /** Still image for the dark scheme, shown under reduced motion. */
  dark: string;
}

export interface AnimatedIconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'title'> {
  /** An icon on the CDN, e.g. `form-reading-lens`. Ignored when `src` is given. */
  name?: string;
  /** Explicit file URLs, for an icon that is not under the CDN's `assets/icons/`. */
  src?: AnimatedIconSources;
  /** Width and height in px, or any CSS length. @default 160 */
  size?: number | string;
  /**
   * `auto` follows `data-color-scheme` on `<html>`, as set by ColorSchemeProvider;
   * `light` and `dark` pin one scheme, for example on a surface that is dark in both.
   * @default 'auto'
   */
  mode?: AnimatedIconMode;
  /** Accessible name. Without it the icon is decorative and hidden from assistive technology. */
  title?: string;
}
