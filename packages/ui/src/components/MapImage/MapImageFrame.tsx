'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { Typography } from '../Typography';
import type { MapImageStatus } from './useMapImage';

export interface MapImageFrameProps extends React.ComponentPropsWithoutRef<'div'> {
  src: string;
  status: MapImageStatus;
  alt: string;
  width: number;
  height: number;
  errorLabel: string;
  onLoad: () => void;
  onError: () => void;
  /** Rendered on top of the image once it has loaded — used by AnimatedMapImage for its pin/ripple. */
  children?: React.ReactNode;
}

// The shell both MapImage and AnimatedMapImage render: a fixed-size box
// (matching the pixel dimensions requested from the API, so the image is
// never CSS-scaled) holding the image itself plus a loading spinner and an
// error fallback sized identically, so nothing shifts layout as status
// changes. Kept always-black regardless of light/dark scheme, since that's
// the map image's own background — a themed loading/error background would
// visibly flash to a different color the instant the image paints.
export const MapImageFrame = React.forwardRef<HTMLDivElement, MapImageFrameProps>(function MapImageFrame(
  { src, status, alt, width, height, errorLabel, onLoad, onError, children, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('relative overflow-hidden rounded-[var(--radius-md)] bg-neutral-900', className)}
      style={{ width, height, ...style }}
      {...props}
    >
      {status !== 'error' && (
        <img
          key={src}
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cx('size-full object-cover', status === 'loading' && 'opacity-0')}
          onLoad={onLoad}
          onError={onError}
        />
      )}
      {status === 'loading' && (
        <div data-testid="map-loading" className="absolute inset-0 flex items-center justify-center">
          <span className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-1 px-4 text-center">
          <Typography level="body-sm" className="text-ink-tertiary">
            {errorLabel}
          </Typography>
        </div>
      )}
      {status === 'loaded' && children}
    </div>
  );
});
