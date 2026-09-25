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
