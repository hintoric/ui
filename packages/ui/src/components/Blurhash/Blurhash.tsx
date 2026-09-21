'use client';
import * as React from 'react';
import { decode } from 'blurhash';
import { cx } from '../../utils/cx';
import type { BlurhashProps } from './types';

/**
 * The decoded gradient of a BlurHash string, painted on a canvas that fills
 * its nearest positioned ancestor.
 *
 * No Joy counterpart. The canvas is deliberately tiny — 32×32 by default —
 * and stretched by the browser; that upscale is what produces the blur, so
 * there is no filter to pay for.
 */
export const Blurhash = React.forwardRef<HTMLCanvasElement, BlurhashProps>(function Blurhash(
  { hash, punch = 1, resolution = 32, className, ...props },
  ref,
) {
  const pixels = React.useMemo(() => {
    try {
      return decode(hash, resolution, resolution, punch);
    } catch {
      // `decode` throws on a malformed hash. A placeholder is decoration and
      // must never take the page down with it, so a bad hash renders nothing
      // and whatever sits behind it shows through.
      return null;
    }
  }, [hash, resolution, punch]);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const setCanvas = React.useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pixels) return;
    // Null under jsdom, and in a browser that has run out of canvas contexts.
    const context = canvas.getContext('2d');
    if (!context) return;
    const image = context.createImageData(resolution, resolution);
    image.data.set(pixels);
    context.putImageData(image, 0, 0);
  }, [pixels, resolution]);

  if (!pixels) return null;

  return (
    <canvas
      ref={setCanvas}
      data-testid="blurhash"
      aria-hidden="true"
      width={resolution}
      height={resolution}
      className={cx('absolute inset-0 size-full', className)}
      {...props}
    />
  );
});
