import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardOverflow } from './CardOverflow';

describe('CardOverflow', () => {
  it('renders its children with negative horizontal margin to bleed past the parent padding', () => {
    render(
      <CardOverflow data-testid="overflow">
        <img src="/a.jpg" alt="a" />
      </CardOverflow>,
    );
    expect(screen.getByTestId('overflow')).toHaveClass('-mx-4');
    expect(screen.getByAltText('a')).toBeInTheDocument();
  });
});
