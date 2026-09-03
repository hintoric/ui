import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders a 12-column grid container', () => {
    render(<Grid container data-testid="g" />);
    expect(screen.getByTestId('g')).toHaveClass('grid', 'grid-cols-12');
  });

  it('applies spacing as a gap', () => {
    render(<Grid container spacing={16} data-testid="g" />);
    expect(screen.getByTestId('g')).toHaveStyle({ gap: '16px' });
  });

  it('spans the given number of columns', () => {
    render(<Grid xs={6} data-testid="g" />);
    expect(screen.getByTestId('g')).toHaveStyle({ gridColumn: 'span 6 / span 6' });
  });

  it('spans the full row when xs is true', () => {
    render(<Grid xs data-testid="g" />);
    expect(screen.getByTestId('g')).toHaveStyle({ gridColumn: '1 / -1' });
  });
});
