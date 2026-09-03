import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is hidden from the accessibility tree', () => {
    render(<Skeleton data-testid="s" variant="text" />);
    expect(screen.getByTestId('s')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a circle for the circular variant', () => {
    render(<Skeleton data-testid="s" variant="circular" width={40} height={40} />);
    expect(screen.getByTestId('s')).toHaveClass('rounded-[50%]');
  });

  it('pulses by default', () => {
    render(<Skeleton data-testid="s" variant="text" />);
    expect(screen.getByTestId('s')).toHaveClass('animate-pulse');
  });

  it('disables the animation when animation=false', () => {
    render(<Skeleton data-testid="s" variant="text" animation={false} />);
    expect(screen.getByTestId('s')).not.toHaveClass('animate-pulse');
  });
});
