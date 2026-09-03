import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinearProgress } from './LinearProgress';

describe('LinearProgress', () => {
  it('renders a progressbar role', () => {
    render(<LinearProgress determinate value={60} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '60');
  });

  it('sizes the bar width to the value when determinate', () => {
    render(<LinearProgress determinate value={30} data-testid="lp" />);
    const bar = screen.getByTestId('lp').firstElementChild as HTMLElement;
    expect(bar).toHaveStyle({ width: '30%' });
  });

  it('pulses when indeterminate', () => {
    render(<LinearProgress data-testid="lp" />);
    const bar = screen.getByTestId('lp').firstElementChild as HTMLElement;
    expect(bar).toHaveClass('animate-pulse');
  });

  it('sizes the track thickness per the size prop', () => {
    render(<LinearProgress size="lg" data-testid="lp" />);
    expect(screen.getByTestId('lp')).toHaveStyle({ minBlockSize: '8px' });
  });
});
