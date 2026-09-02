'use client';
import * as React from 'react';

export type ColorSchemeMode = 'light' | 'dark';

interface ColorSchemeContextValue {
  mode: ColorSchemeMode;
  setMode: (mode: ColorSchemeMode) => void;
}

const ColorSchemeContext = React.createContext<ColorSchemeContextValue | null>(null);

const STORAGE_KEY = 'hintoric-color-scheme';

export interface ColorSchemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ColorSchemeMode;
}

export function ColorSchemeProvider({
  children,
  defaultMode = 'light',
}: ColorSchemeProviderProps) {
  const [mode, setModeState] = React.useState<ColorSchemeMode>(() => {
    if (typeof window === 'undefined') {
      return defaultMode;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : defaultMode;
  });

  const setMode = React.useCallback((next: ColorSchemeMode) => {
    setModeState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ColorSchemeContext.Provider value={value}>
      <div data-color-scheme={mode}>{children}</div>
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
