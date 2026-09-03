import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuList } from './MenuList';

describe('MenuList', () => {
  it('renders as a ul', () => {
    render(
      <MenuList>
        <li>Item</li>
      </MenuList>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('defaults to plain/neutral', () => {
    render(<MenuList data-testid="list" />);
    expect(screen.getByTestId('list')).toHaveClass('text-neutral-plain-color', 'bg-surface');
  });
});
