import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '../../theme/ColorSchemeProvider';
import { ColorSchemeSelect } from './ColorSchemeSelect';

function ModeProbe() {
  const { mode } = useColorScheme();
  return <span data-testid="mode">{mode}</span>;
}

function renderSelect(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ModeProbe />
      <ColorSchemeSelect {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeSelect', () => {
  it('shows the current mode on the trigger', () => {
    renderSelect();
    expect(screen.getByRole('combobox')).toHaveTextContent('System');
  });

  it('offers all three modes when opened', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));

    expect(await screen.findByRole('option', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument();
  });

  it('sets the mode to the chosen option', async () => {
    renderSelect();
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Dark' }));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('sets the mode by value even when the label is translated', async () => {
    renderSelect({ labels: { dark: 'Dunkel' } });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Dunkel' }));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('forwards unrecognised props to the trigger', () => {
    renderSelect({ 'data-testid': 'select' });
    expect(screen.getByTestId('select')).toBeInTheDocument();
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeSelect />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
