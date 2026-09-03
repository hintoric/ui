import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CircularProgress } from './CircularProgress';

describe('CircularProgress', () => {
  it('renders a progressbar role', () => {
    render(<CircularProgress determinate value={40} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');
  });

  it('renders an SVG ring', () => {
    render(<CircularProgress />);
    expect(screen.getByRole('progressbar').querySelector('svg')).toBeInTheDocument();
  });

  it('spins when indeterminate', () => {
    render(<CircularProgress />);
    expect(screen.getByRole('progressbar').querySelector('svg')).toHaveClass('animate-spin');
  });

  it('does not spin when determinate', () => {
    render(<CircularProgress determinate value={50} />);
    expect(screen.getByRole('progressbar').querySelector('svg')).not.toHaveClass('animate-spin');
  });

  it('renders children centered on top', () => {
    render(<CircularProgress>50%</CircularProgress>);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('sizes the box per the size prop', () => {
    render(<CircularProgress size="lg" data-testid="cp" />);
    expect(screen.getByTestId('cp')).toHaveStyle({ width: '64px', height: '64px' });
  });
});
