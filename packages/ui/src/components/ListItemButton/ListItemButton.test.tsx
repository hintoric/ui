import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListItemButton } from './ListItemButton';

describe('ListItemButton', () => {
  it('renders a button with its children', () => {
    render(<ListItemButton>Item</ListItemButton>);
    expect(screen.getByRole('button', { name: 'Item' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral when unselected', () => {
    render(<ListItemButton>Item</ListItemButton>);
    expect(screen.getByRole('button')).toHaveClass('text-neutral-plain-color');
  });

  it('keeps plain/neutral when selected, applying the persistent active background', () => {
    render(<ListItemButton selected>Item</ListItemButton>);
    expect(screen.getByRole('button')).toHaveClass('text-neutral-plain-color', 'bg-neutral-plain-active-bg');
  });

  it('keeps an explicit variant/color when selected, using its own active background', () => {
    render(
      <ListItemButton variant="outlined" color="danger" selected>
        Item
      </ListItemButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('border-danger-outlined-border', 'bg-danger-outlined-active-bg');
  });
});
