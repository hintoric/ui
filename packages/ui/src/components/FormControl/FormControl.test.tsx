import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormControl } from './FormControl';
import { FormLabel } from '../FormLabel';

describe('FormControl', () => {
  it('renders children in a vertical flex column by default', () => {
    render(
      <FormControl data-testid="fc">
        <FormLabel>Email</FormLabel>
      </FormControl>,
    );
    expect(screen.getByTestId('fc')).toHaveClass('flex-col');
  });

  it('switches to a horizontal row', () => {
    render(<FormControl data-testid="fc" orientation="horizontal" />);
    expect(screen.getByTestId('fc')).toHaveClass('flex-row');
  });

  it('passes required down to a nested FormLabel via context', () => {
    render(
      <FormControl required>
        <FormLabel>Email</FormLabel>
      </FormControl>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
