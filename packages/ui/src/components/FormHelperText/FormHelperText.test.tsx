import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormHelperText } from './FormHelperText';

describe('FormHelperText', () => {
  it('renders its children with tertiary text color', () => {
    render(<FormHelperText>We never share your email.</FormHelperText>);
    expect(screen.getByText('We never share your email.')).toHaveClass('text-ink-tertiary');
  });
});
