import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sheet } from './Sheet';

describe('Sheet', () => {
  it('defaults to plain/neutral', () => {
    render(<Sheet data-testid="sheet">content</Sheet>);
    // plain falls back to a surface background in Joy UI, not a transparent one.
    expect(screen.getByTestId('sheet')).toHaveClass('text-neutral-plain-color', 'bg-surface');
  });

  it('has no border radius of its own (Card adds its own on top of Sheet)', () => {
    render(<Sheet data-testid="sheet">content</Sheet>);
    expect(screen.getByTestId('sheet')).not.toHaveClass('rounded-sm', 'rounded-md');
  });

  it('applies solid/primary classes when requested', () => {
    render(
      <Sheet variant="solid" color="primary" data-testid="sheet">
        content
      </Sheet>,
    );
    expect(screen.getByTestId('sheet')).toHaveClass('bg-primary-solid-bg', 'text-primary-solid-color');
  });

  it('renders the element passed via the component prop', () => {
    render(<Sheet component="section" data-testid="sheet" />);
    expect(screen.getByTestId('sheet').tagName).toBe('SECTION');
  });
});
