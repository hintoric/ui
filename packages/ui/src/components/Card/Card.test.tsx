import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('defaults to outlined/neutral with a column flex layout and its own radius', () => {
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId('card');
    // Card imposes its own radius since bare Sheet has none.
    expect(el).toHaveClass('border-neutral-outlined-border', 'flex', 'flex-col', 'rounded-md');
  });

  it('applies a different variant/color when requested', () => {
    render(
      <Card variant="soft" color="success" data-testid="card">
        content
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('bg-success-soft-bg');
  });

  it('renders its children', () => {
    render(<Card>hello card</Card>);
    expect(screen.getByText('hello card')).toBeInTheDocument();
  });
});
