'use client';
import * as React from 'react';

export type ColorSchemeMode = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

interface ColorSchemeContextValue {
  /** What the user chose. `'system'` is a real, persisted choice. */
  mode: ColorSchemeMode;
  /** What is actually painted — never `'system'`. */
  resolvedMode: ResolvedColorScheme;
  setMode: (mode: ColorSchemeMode) => void;
}

const ColorSchemeContext = React.createContext<ColorSchemeContextValue | null>(null);

const STORAGE_KEY = 'hintoric-color-scheme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function isMode(value: unknown): value is ColorSchemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function storedMode(): ColorSchemeMode | undefined {
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isMode(stored) ? stored : undefined;
}

function subscribeToSystem(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function systemSnapshot(): ResolvedColorScheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/*
 * `useSyncExternalStore` rather than an effect that copies matchMedia into
 * state: it gives server rendering a defined snapshot instead of a value that
 * only appears after hydration and visibly flips, and it ties the
 * subscription's lifetime to the read.
 */
function serverSnapshot(): ResolvedColorScheme {
  return 'light';
}

export interface ColorSchemeProviderProps {
  children: React.ReactNode;
  /**
   * Which mode applies when the user has never chosen one. Defaults to
   * `'system'` — the browser's own preference. Pass `'light'` for the
   * pre-system-mode behaviour.
   */
  defaultMode?: ColorSchemeMode;
}

export function ColorSchemeProvider({ children, defaultMode = 'system' }: ColorSchemeProviderProps) {
  const [mode, setModeState] = React.useState<ColorSchemeMode>(() => storedMode() ?? defaultMode);

  const systemScheme = React.useSyncExternalStore(subscribeToSystem, systemSnapshot, serverSnapshot);

  const setMode = React.useCallback((next: ColorSchemeMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      // 'system' is written, not cleared: an absent key means "never chose",
      // which a consumer's defaultMode is entitled to answer. Clearing would
      // let defaultMode overwrite an explicit choice on the next load.
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  // Two tabs of the same app disagreeing about the colour scheme reads as a
  // bug, so adopt what another tab stored.
  React.useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      if (isMode(event.newValue)) setModeState(event.newValue);
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const resolvedMode: ResolvedColorScheme = mode === 'system' ? systemScheme : mode;

  /*
   * The wrapper <div> below is not enough on its own. Base UI mounts every
   * portalled surface — Menu, Select's listbox, Modal, Drawer, Tooltip,
   * Snackbar — onto document.body, which makes them SIBLINGS of that div
   * rather than descendants, so the dark tokens never cascade to them. A dark
   * app with a light popup was the result, and it affected most of the
   * library's overlay surface.
   *
   * Mirroring the attribute onto <html> fixes every portal at once, because
   * document.body is a descendant of it. The div stays: it carries the
   * attribute during server rendering and the first paint, before this effect
   * has run.
   *
   * The trade-off is that <html> is shared. Two nested providers asking for
   * different schemes will fight over it, and the innermost mounted one wins
   * for portalled content while each div still governs its own in-flow
   * subtree. Nesting providers with different schemes is not supported.
   */
  React.useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-color-scheme');
    root.setAttribute('data-color-scheme', resolvedMode);
    return () => {
      if (previous === null) root.removeAttribute('data-color-scheme');
      else root.setAttribute('data-color-scheme', previous);
    };
  }, [resolvedMode]);

  const value = React.useMemo(() => ({ mode, resolvedMode, setMode }), [mode, resolvedMode, setMode]);

  return (
    <ColorSchemeContext.Provider value={value}>
      {/* resolvedMode, never mode: theme.css defines tokens for light and dark
          only, so data-color-scheme="system" would silently drop every dark
          override and leave the app on :root's light values. */}
      <div data-color-scheme={resolvedMode}>{children}</div>
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme(): ColorSchemeContextValue {
  const context = React.useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
}
