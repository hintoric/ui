'use client';
import * as React from 'react';
import { isBlurhashValid } from 'blurhash';
import { cx } from '../../utils/cx';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion';
import { AspectRatio } from '../AspectRatio';
import { Blurhash } from '../Blurhash';
import { Skeleton } from '../Skeleton';
import type { BlurhashImageProps } from './types';

/**
 * A picture that holds its own place: the BlurHash paints immediately, the
 * real image fades in over it.
 *
 * No Joy counterpart. This is the Skeleton role — reserve the space, say
 * "something is coming" — filled with the colours of the actual picture
 * instead of a grey rectangle. Without a `hash` it really is a Skeleton.
 */
export const BlurhashImage = React.forwardRef<HTMLImageElement, BlurhashImageProps>(function BlurhashImage(
  {
    src,
    alt,
    hash,
    ratio = '16 / 9',
    punch,
    resolution,
    objectFit = 'cover',
    className,
    style,
    onLoad,
    onError,
    ...props
  },
  ref,
) {
  // Keyed by src rather than a bare boolean: swapping the src has to show the
  // placeholder again, and `key={src}` below remounts the element to match.
  const [loadedSrc, setLoadedSrc] = React.useState<string | null>(null);
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  const loaded = src !== undefined && loadedSrc === src;
  const failed = src !== undefined && failedSrc === src;
  const reducedMotion = usePrefersReducedMotion();
  // Validity, not presence: a truncated hash is still a non-empty string, and
  // Blurhash renders nothing for one — which would leave the box with no
  // loading affordance at all, strictly worse than having no hash.
  const usableHash = hash !== undefined && isBlurhashValid(hash).result;

  const setImage = React.useCallback(
    (node: HTMLImageElement | null) => {
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
      // An image served from cache finishes before React attaches onLoad, so
      // that event never fires and the picture would stay invisible for good.
      if (node?.complete && node.naturalWidth > 0) setLoadedSrc(node.getAttribute('src'));
    },
    [ref],
  );

  return (
    <AspectRatio
      data-testid="blurhash-image"
      ratio={ratio}
      className={cx('bg-surface-2', className)}
      style={style}
    >
      {usableHash ? (
        // Left mounted behind the loaded image: it costs nothing there, and a
        // later src change reveals it again without a second decode.
        <Blurhash hash={hash} punch={punch} resolution={resolution} />
      ) : (
        // A pulse that never stops reads as "still loading"; once the image
        // has failed, nothing more is coming, so it holds still.
        !loaded && <Skeleton variant="overlay" animation={failed ? false : 'pulse'} />
      )}
      {src !== undefined && (
        <img
          key={src}
          ref={setImage}
          src={src}
          alt={alt}
          decoding="async"
          className={cx(
            'absolute inset-0 size-full',
            !reducedMotion && 'transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectFit }}
          // The props type is the props of an <img>, so srcSet, sizes,
          // loading and crossOrigin have to reach the image itself.
          {...props}
          onLoad={(event) => {
            setLoadedSrc(src);
            onLoad?.(event);
          }}
          onError={(event) => {
            // The blurhash underneath stays: a blurred picture is a better
            // broken state than an icon, and the layout does not move.
            setFailedSrc(src);
            onError?.(event);
          }}
        />
      )}
    </AspectRatio>
  );
});
