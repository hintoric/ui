import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { setSystemDark } from '../../test/setup';
import { ColorSchemeSwitch } from './ColorSchemeSwitch';

function ModeProbe() {
  const { mode, resolvedMode } = useColorScheme();
  return (
    <>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
    </>
  );
}

function renderSwitch(
  props: Record<string, unknown> = {},
  defaultMode: 'system' | 'light' | 'dark' = 'system',
) {
  return render(
    <ColorSchemeProvider defaultMode={defaultMode}>
      <ModeProbe />
      <ColorSchemeSwitch {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeSwitch', () => {
  it('is unchecked while the resolved scheme is light', () => {
    renderSwitch();
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('is checked while the resolved scheme is dark, even in system mode', () => {
    setSystemDark(true);
    renderSwitch();
    // It mirrors what is on screen, not the raw choice — a switch showing
    // "off" on a dark screen would be plainly wrong.
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it('leaves system for a fixed mode when toggled', async () => {
    renderSwitch();
    await userEvent.click(screen.getByRole('switch'));

    // The user made a decision; quietly continuing to follow the OS would be
    // the more surprising outcome. A switch has two positions, so there is no
    // way back to system from here — that is what the three-state forms are for.
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('toggles back to light', async () => {
    renderSwitch({}, 'dark');
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });

  it('labels the effect of a click', () => {
    renderSwitch();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('lets a caller override the label', () => {
    renderSwitch({ 'aria-label': 'Dunkelmodus' });
    expect(screen.getByRole('switch')).toHaveAttribute('aria-label', 'Dunkelmodus');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeSwitch />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
