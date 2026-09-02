import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from './ColorSchemeProvider';

function Consumer() {
  const { mode, setMode } = useColorScheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button type="button" onClick={() => setMode('dark')}>
        go dark
      </button>
    </div>
  );
}

describe('ColorSchemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('defaults to light mode and sets data-color-scheme on its wrapper', () => {
    render(
      <ColorSchemeProvider>
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
});
