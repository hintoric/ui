import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dropdown } from '../Dropdown';
import { MenuButton } from './MenuButton';
import { Menu } from '../Menu';
import { MenuItem } from '../MenuItem';

describe('MenuButton', () => {
  it('renders as a button', () => {
    render(
      <Dropdown>
        <MenuButton>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(
      <Dropdown>
        <MenuButton disabled>Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();
  });

  it('defaults to outlined/neutral/md', () => {
    render(
      <Dropdown>
        <MenuButton data-testid="btn">Open</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    expect(screen.getByTestId('btn')).toHaveClass('text-neutral-outlined-color', 'min-h-9');
  });
});
