import * as React from 'react';

const MAP_IMAGE_ENDPOINT = 'https://map-image.api.hintoric.cloud/api/map';

export type MapImageStatus = 'loading' | 'loaded' | 'error';

export interface UseMapImageOptions {
  lat: number;
  lng: number;
  width: number;
  height: number;
  zoom: number;
  onLoad?: () => void;
  onError?: () => void;
}

export interface UseMapImageResult {
  src: string;
  status: MapImageStatus;
  handleLoad: () => void;
  handleError: () => void;
}

export function buildMapImageSrc(lat: number, lng: number, width: number, height: number, zoom: number): string {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    width: String(width),
    height: String(height),
    zoom: String(zoom),
  });
  return `${MAP_IMAGE_ENDPOINT}?${params.toString()}`;
}

// Shared by MapImage and AnimatedMapImage — same fetch/loading-state
// behavior for both, only the surrounding markup (and, for the animated
// variant, an entrance effect) differs. See MapImageFrame.
export function useMapImage({ lat, lng, width, height, zoom, onLoad, onError }: UseMapImageOptions): UseMapImageResult {
  const src = buildMapImageSrc(lat, lng, width, height, zoom);
  const [status, setStatus] = React.useState<MapImageStatus>('loading');

  // "Adjusting state when a prop changes" (React docs), not a useEffect: a
  // coordinate/size/zoom change should re-show the loading state rather than
  // leave the previous image frozen on screen, and doing it during render
  // (vs. an effect) avoids an extra commit where the stale image would
  // otherwise flash before the reset takes effect.
  const [prevSrc, setPrevSrc] = React.useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus('loading');
  }

  const handleLoad = React.useCallback(() => {
    setStatus('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleError = React.useCallback(() => {
    setStatus('error');
    onError?.();
  }, [onError]);

  return { src, status, handleLoad, handleError };
}
