import type * as React from 'react';

export interface BlurhashImageProps extends Omit<React.ComponentPropsWithoutRef<'img'>, 'placeholder'> {
  /**
   * Omit it while the URL is still being fetched: no `<img>` is rendered at
   * all, and the placeholder holds the space. An empty string would resolve
   * to the page itself and fire an error instead.
   */
  src?: string;
  alt: string;
  /**
   * The picture's BlurHash. Without one the placeholder is a plain
   * {@link Skeleton}, so a missing hash degrades rather than breaks.
   */
  hash?: string;
  /** Passed to {@link AspectRatio}. The box keeps this shape while loading. */
  ratio?: string | number;
  /** Contrast of the decoded gradient. 1 is the hash as encoded. */
  punch?: number;
  /** Edge length in pixels the hash is decoded to. */
  resolution?: number;
  objectFit?: React.CSSProperties['objectFit'];
}
