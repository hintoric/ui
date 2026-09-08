'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion';
import { useMapImage } from '../MapImage/useMapImage';
import { MapImageFrame } from '../MapImage/MapImageFrame';
import type { AnimatedMapImageProps } from './types';

// Same fetch/loading-state machine as MapImage (see useMapImage), rendered
// through the same MapImageFrame shell — this only adds a one-time entrance
// once the image finishes loading: the whole frame irises open from center
// (map-reveal) while a pin drops onto the coordinate and an ink ring ripples
// out from under it. Skipped entirely under prefers-reduced-motion, which
// just leaves the frame in its final, fully-revealed state.
export const AnimatedMapImage = React.forwardRef<HTMLDivElement, AnimatedMapImageProps>(function AnimatedMapImage(
  { lat, lng, zoom = 15, width = 480, height = 320, alt, errorLabel = 'Map unavailable', onLoad, onError, className, ...props },
  ref,
) {
  const { src, status, handleLoad, handleError } = useMapImage({ lat, lng, width, height, zoom, onLoad, onError });
  const reducedMotion = usePrefersReducedMotion();
  const playEntrance = status === 'loaded' && !reducedMotion;

  return (
    <MapImageFrame
      ref={ref}
      src={src}
      status={status}
      alt={alt ?? `Map centered at ${lat}, ${lng}`}
      width={width}
      height={height}
      errorLabel={errorLabel}
      onLoad={handleLoad}
      onError={handleError}
      className={cx(playEntrance && 'animate-map-reveal', className)}
      {...props}
    >
      {playEntrance && (
        <div data-testid="map-pin" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="absolute size-8 animate-ink-ripple rounded-full border-2 border-white/70" />
          <span className="absolute size-3 animate-pin-drop rounded-full bg-white shadow-[0_0_0_2px_rgba(0,0,0,0.4)]" />
        </div>
      )}
    </MapImageFrame>
  );
});
