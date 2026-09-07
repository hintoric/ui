import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormControl } from './FormControl';
import { FormLabel } from '../FormLabel';
import { Input } from '../Input';

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

  it('cascades its error state into the field colour', () => {
    render(
      <FormControl error>
        <Input aria-label="feld" />
      </FormControl>,
    );
    const wrapper = screen.getByRole('textbox', { name: 'feld' }).parentElement!;
    expect(wrapper).toHaveClass('border-danger-outlined-border');
  });

  it('does not override a colour the caller set explicitly', () => {
    render(
      <FormControl error>
        <Input aria-label="feld" color="success" />
      </FormControl>,
    );
    const wrapper = screen.getByRole('textbox', { name: 'feld' }).parentElement!;
    expect(wrapper).toHaveClass('border-success-outlined-border');
  });

  it('cascades disabled into the field', () => {
    render(
      <FormControl disabled>
        <Input aria-label="feld" />
      </FormControl>,
    );
    expect(screen.getByRole('textbox', { name: 'feld' })).toBeDisabled();
  });
});
