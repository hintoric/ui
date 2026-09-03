import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from './Dropdown';
import { MenuButton } from '../MenuButton';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';

// Note: Base UI's Menu.Root doesn't reliably invoke `onOpenChange` in jsdom
// (verified directly against the raw primitive, not just this wrapper —
// likely a floating-ui/jsdom interaction gap), so that callback isn't
// exercised here. The open-state behavior it reports IS covered below via
// the resulting DOM state, and via Menu.test.tsx's own open/close coverage.
describe('Dropdown', () => {
  it('respects defaultOpen', () => {
    render(
      <Dropdown defaultOpen>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('supports a fully controlled open prop', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown open={false}>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    // Controlled `open={false}` keeps the menu closed even after a click,
    // since nothing updates the prop in response.
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
