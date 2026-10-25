'use client';
import * as React from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const ReducedMotionContext = React.createContext<boolean | undefined>(undefined);

export interface ReducedMotionProviderProps {
  children: React.ReactNode;
  /** The app-owned reduced-motion preference. */
  reducedMotion: boolean;
}

export function ReducedMotionProvider({ children, reducedMotion }: ReducedMotionProviderProps) {
  /*
   * Mirrored onto <html> like ColorSchemeProvider's data-color-scheme, for
   * what cannot read this context: @hintoric/icons' animated icons, which do
   * not depend on this package, and plain CSS. The same caveat applies —
   * <html> is shared, so nested providers with different values fight over it.
   */
  React.useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-reduced-motion');
    root.setAttribute('data-reduced-motion', reducedMotion ? 'reduce' : 'no-preference');
    return () => {
      if (previous === null) root.removeAttribute('data-reduced-motion');
      else root.setAttribute('data-reduced-motion', previous);
    };
  }, [reducedMotion]);

  return (
    <ReducedMotionContext.Provider value={reducedMotion}>{children}</ReducedMotionContext.Provider>
  );
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function snapshot(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function serverSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  const provided = React.useContext(ReducedMotionContext);
  const system = React.useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return provided ?? system;
}
