import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders an <hr> with no children', () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId('divider').tagName).toBe('HR');
  });

  it('renders a horizontal line by default', () => {
    render(<Divider data-testid="divider" />);
    expect(screen.getByTestId('divider')).toHaveClass('h-px', 'w-auto');
  });

  it('renders a vertical line', () => {
    render(<Divider data-testid="divider" orientation="vertical" />);
    expect(screen.getByTestId('divider')).toHaveClass('h-auto', 'w-px');
  });

  it('renders a <div role="separator"> when children are present', () => {
    render(<Divider data-testid="divider">OR</Divider>);
    const el = screen.getByTestId('divider');
    expect(el.tagName).toBe('DIV');
    expect(el).toHaveAttribute('role', 'separator');
    expect(screen.getByText('OR')).toBeInTheDocument();
  });
});
