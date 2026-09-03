import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormLabel } from './FormLabel';

describe('FormLabel', () => {
  it('renders as a <label>', () => {
    render(<FormLabel htmlFor="x">Email</FormLabel>);
    expect(screen.getByText('Email').tagName).toBe('LABEL');
  });

  it('shows a red asterisk when required', () => {
    render(<FormLabel required>Email</FormLabel>);
    expect(screen.getByText('*')).toHaveClass('text-danger-500');
  });

  it('does not show an asterisk by default', () => {
    render(<FormLabel>Email</FormLabel>);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});
