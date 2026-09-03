import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardActions } from './CardActions';

describe('CardActions', () => {
  it('renders its children in a flex row by default', () => {
    render(
      <CardActions data-testid="a">
        <button>Save</button>
      </CardActions>,
    );
    expect(screen.getByTestId('a')).toHaveClass('flex-row');
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('supports a vertical orientation', () => {
    render(<CardActions data-testid="a" orientation="vertical" />);
    expect(screen.getByTestId('a')).toHaveClass('flex-col');
  });
});
