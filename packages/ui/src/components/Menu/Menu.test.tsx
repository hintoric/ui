import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown } from '../Dropdown';
import { MenuButton } from '../MenuButton';
import { Menu } from './Menu';
import { MenuItem } from '../MenuItem';

describe('Menu', () => {
  it('is closed by default', () => {
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('opens when the MenuButton is clicked', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
  });

  it('calls onClick and closes when an item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem onClick={onClick}>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('does not fire onClick when the item is disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem onClick={onClick} disabled>
            Item 1
          </MenuItem>
        </Menu>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByText('Item 1'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('defaults to outlined/neutral/md', () => {
    render(
      <Dropdown open>
        <MenuButton>Open</MenuButton>
        <Menu data-testid="menu">
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.getByTestId('menu')).toHaveClass('text-neutral-outlined-color');
  });
});
