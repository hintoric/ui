import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';
import { MenuButton } from '../MenuButton';
import { Menu } from '../Menu';
import { MenuItem } from './MenuItem';

describe('MenuItem', () => {
  it('renders its selected styling class when selected', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem selected data-testid="item">
            Item 1
          </MenuItem>
        </Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByTestId('item')).toHaveClass('bg-neutral-plain-active-bg');
  });

  it('moves the highlighted attribute with arrow-key navigation', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Alpha</MenuItem>
          <MenuItem>Beta</MenuItem>
        </Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    const alpha = await screen.findByText('Alpha');
    const beta = screen.getByText('Beta');

    await user.keyboard('{ArrowDown}');
    expect(alpha).toHaveAttribute('data-highlighted');
    expect(beta).not.toHaveAttribute('data-highlighted');

    await user.keyboard('{ArrowDown}');
    expect(beta).toHaveAttribute('data-highlighted');
    expect(alpha).not.toHaveAttribute('data-highlighted');
  });
});
