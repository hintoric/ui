import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider } from '../../theme/ColorSchemeProvider';
import { ColorSchemeToggle } from './ColorSchemeToggle';

function renderToggle(props: Record<string, unknown> = {}) {
  return render(
    <ColorSchemeProvider defaultMode="system">
      <ColorSchemeToggle {...props} />
    </ColorSchemeProvider>,
  );
}

describe('ColorSchemeToggle', () => {
  it('cycles system to light to dark and back', async () => {
    renderToggle();
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to system mode');
    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('labels the effect of a click, not the current state', () => {
    renderToggle();
    // A button that announces where it already is never tells the user what
    // pressing it does.
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to light mode');
  });

  it('shows the chosen mode rather than the resolved one', async () => {
    const { container } = renderToggle();
    const iconOf = () => container.querySelector('svg path')?.getAttribute('d');

    // In `system` on a light OS, resolvedMode is 'light'. Showing the sun here
    // would make "follows the system" indistinguishable from "pinned to light".
    const systemIcon = iconOf();
    await userEvent.click(screen.getByRole('button'));
    expect(iconOf()).not.toBe(systemIcon);
  });

  it('lets a caller override the label', () => {
    renderToggle({ 'aria-label': 'Farbschema wechseln' });
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Farbschema wechseln');
  });

  it('still cycles when the caller passes their own onClick', async () => {
    const onClick = vi.fn();
    renderToggle({ onClick });
    const button = screen.getByRole('button');

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
  });

  it('forwards unrecognised props to the button', () => {
    renderToggle({ 'data-testid': 'toggle', className: 'custom' });
    expect(screen.getByTestId('toggle')).toHaveClass('custom');
  });

  it('throws outside a ColorSchemeProvider', () => {
    expect(() => render(<ColorSchemeToggle />)).toThrow(
      'useColorScheme must be used within a ColorSchemeProvider',
    );
  });
});
