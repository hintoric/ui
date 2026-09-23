import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('renders startDecorator and endDecorator around the label, as Button does', () => {
    render(
      <Dropdown>
        <MenuButton startDecorator={<span data-testid="start">+</span>} endDecorator={<span data-testid="end">▾</span>}>
          Create
        </MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    const button = screen.getByRole('button', { name: /Create/ });
    expect(button).toContainElement(screen.getByTestId('start'));
    expect(button).toContainElement(screen.getByTestId('end'));
  });

  it('disables itself and opens nothing while loading', async () => {
    render(
      <Dropdown>
        <MenuButton loading>Create</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    const button = screen.getByRole('button', { name: /Create/ });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
  });

  it('rounds its ends fully as a pill', () => {
    render(
      <Dropdown>
        <MenuButton pill>Create</MenuButton>
        <Menu>
          <MenuItem>Item 1</MenuItem>
        </Menu>
      </Dropdown>,
    );
    const button = screen.getByRole('button', { name: 'Create' });
    expect(button).toHaveClass('rounded-full');
    expect(button).not.toHaveClass('rounded-sm');
  });
});
