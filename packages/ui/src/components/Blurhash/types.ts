import type * as React from 'react';

export interface BlurhashProps extends Omit<React.ComponentPropsWithoutRef<'canvas'>, 'width' | 'height'> {
  /** A BlurHash string, as produced by `encodeBlurhash` or by your backend. */
  hash: string;
  /** Contrast of the decoded gradient. 1 is the hash as encoded. */
  punch?: number;
  /**
   * Edge length in pixels the hash is decoded to. The canvas is then stretched
   * over its container, so bigger is smoother but quadratically slower — and
   * past about 32 the difference stops being visible.
   */
  resolution?: number;
}
