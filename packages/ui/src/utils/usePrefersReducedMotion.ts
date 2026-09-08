import * as React from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function snapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function serverSnapshot(): boolean {
  return false;
}

/** Same useSyncExternalStore approach as ColorSchemeProvider's system-scheme detection. */
export function usePrefersReducedMotion(): boolean {
  return React.useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
