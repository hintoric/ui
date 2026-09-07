import { describe, expect, it, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from './ColorSchemeProvider';
import { setSystemDark } from '../test/setup';

function Consumer() {
  const { mode, resolvedMode, setMode } = useColorScheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <button type="button" onClick={() => setMode('dark')}>
        go dark
      </button>
      <button type="button" onClick={() => setMode('system')}>
        go system
      </button>
    </div>
  );
}

describe('ColorSchemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('honours an explicit light defaultMode and sets data-color-scheme on its wrapper', () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'light',
    );
  });

  it('switches mode and updates the data attribute when setMode is called', async () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'dark',
    );
  });

  it('persists the chosen mode to localStorage', async () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go dark' }));
    expect(window.localStorage.getItem('hintoric-color-scheme')).toBe('dark');
  });

  it('throws a clear error when useColorScheme is used outside the provider', () => {
    function Bad() {
      useColorScheme();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });

  it('defaults to system and resolves it from the browser preference', () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'light',
    );
  });

  it('resolves system to dark when the browser prefers dark', () => {
    setSystemDark(true);
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('follows a browser preference change without a reload', async () => {
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    await act(async () => {
      setSystemDark(true);
    });

    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('never puts system on the data attribute', () => {
    setSystemDark(true);
    render(
      <ColorSchemeProvider>
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode').closest('[data-color-scheme]')).toHaveAttribute(
      'data-color-scheme',
      'dark',
    );
  });

  it('persists system explicitly rather than clearing the key', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'go system' }));

    // Clearing the key would let defaultMode="light" overwrite this choice on
    // the next load — the user asked to follow the system, not to reset.
    expect(window.localStorage.getItem('hintoric-color-scheme')).toBe('system');
  });

  it('prefers a stored mode over defaultMode', () => {
    window.localStorage.setItem('hintoric-color-scheme', 'dark');
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('falls back to defaultMode when the stored value is not a mode', () => {
    window.localStorage.setItem('hintoric-color-scheme', 'aubergine');
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('adopts a mode chosen in another tab', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );

    await act(async () => {
      window.localStorage.setItem('hintoric-color-scheme', 'dark');
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'hintoric-color-scheme', newValue: 'dark' }),
      );
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('ignores storage events for other keys', async () => {
    render(
      <ColorSchemeProvider defaultMode="light">
        <Consumer />
      </ColorSchemeProvider>,
    );

    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'something-else', newValue: 'dark' }));
    });

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });
});
