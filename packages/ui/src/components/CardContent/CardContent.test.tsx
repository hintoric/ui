import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardContent } from './CardContent';

describe('CardContent', () => {
  it('renders its children in a flex column by default', () => {
    render(
      <CardContent data-testid="c">
        <p>Body</p>
      </CardContent>,
    );
    expect(screen.getByTestId('c')).toHaveClass('flex-col', 'grow');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
