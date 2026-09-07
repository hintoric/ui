import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { ColorSchemeMenu } from './ColorSchemeMenu';

function renderMenu(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ColorSchemeMenu {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeMenu', () => {
  it('shows the current mode on the trigger', () => {
    renderMenu();
    expect(screen.getByRole('button')).toHaveTextContent('System');
  });

  it('lists all three modes when opened', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    // 'System' appears on the trigger as well as in the list.
    expect(screen.getAllByText('System')).toHaveLength(2);
  });

  it('changes the mode and updates the trigger', async () => {
    renderMenu();
    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(await screen.findByText('Dark'));

    expect(screen.getByRole('button')).toHaveTextContent('Dark');
  });

  it('applies translated labels to the trigger too', () => {
    renderMenu({ labels: { system: 'Automatisch' } });
    expect(screen.getByRole('button')).toHaveTextContent('Automatisch');
  });

  it('forwards unrecognised props to the trigger', () => {
    renderMenu({ 'data-testid': 'trigger', className: 'custom' });
    expect(screen.getByTestId('trigger')).toHaveClass('custom');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeMenu />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
