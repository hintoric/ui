import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeToggleGroup } from './ColorSchemeToggleGroup';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <ColorSchemeToggleGroup {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeToggleGroup', () => {
  it('renders one segment per mode', () => {
    renderGroup();
    expect(screen.getByRole('button', { name: /System/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Light/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dark/ })).toBeInTheDocument();
  });

  it('sets the mode to the segment that was clicked', async () => {
    renderGroup();
    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('does nothing when the already-active segment is clicked', async () => {
    renderGroup();
    // ToggleButtonGroup implements multi-select semantics, so a click on a
    // selected value deselects it and hands back an empty array. There is no
    // such thing as "no colour scheme", so that has to be a no-op rather than
    // an undefined mode.
    await userEvent.click(screen.getByRole('button', { name: /System/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('keeps exactly one segment active after several clicks', async () => {
    renderGroup();
    await userEvent.click(screen.getByRole('button', { name: /Light/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    await userEvent.click(screen.getByRole('button', { name: /Dark/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    await userEvent.click(screen.getByRole('button', { name: /System/ }));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('overrides only the labels it is given', () => {
    renderGroup({ labels: { dark: 'Dunkel' } });
    expect(screen.getByRole('button', { name: /Dunkel/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /System/ })).toBeInTheDocument();
  });

  it('forwards unrecognised props to the group', () => {
    renderGroup({ 'data-testid': 'group' });
    expect(screen.getByTestId('group')).toBeInTheDocument();
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeToggleGroup />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
