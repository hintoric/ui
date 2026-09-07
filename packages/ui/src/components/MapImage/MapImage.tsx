'use client';
import * as React from 'react';
import { useMapImage } from './useMapImage';
import { MapImageFrame } from './MapImageFrame';
import type { MapImageProps } from './types';

export const MapImage = React.forwardRef<HTMLDivElement, MapImageProps>(function MapImage(
  { lat, lng, zoom = 15, width = 480, height = 320, alt, errorLabel = 'Map unavailable', onLoad, onError, ...props },
  ref,
) {
  const { src, status, handleLoad, handleError } = useMapImage({ lat, lng, width, height, zoom, onLoad, onError });

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
      {...props}
    />
  );
});
