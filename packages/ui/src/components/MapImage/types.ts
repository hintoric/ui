import type * as React from 'react';

export interface MapImageProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children' | 'onLoad' | 'onError'> {
  /** Latitude of the map center, -90 to 90. */
  lat: number;
  /** Longitude of the map center, -180 to 180. */
  lng: number;
  /** Zoom level, 1-19. */
  zoom?: number;
  /** Image width in pixels, 64-2048. */
  width?: number;
  /** Image height in pixels, 64-2048. */
  height?: number;
  /** Accessible alt text. Defaults to a description including the coordinates. */
  alt?: string;
  /** Text shown when the map image fails to load. */
  errorLabel?: string;
  /** Called once the map image has finished loading. */
  onLoad?: () => void;
  /** Called if the map image fails to load (e.g. out-of-range coordinates). */
  onError?: () => void;
}
