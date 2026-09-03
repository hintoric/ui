import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders its children', () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText('Something happened')).toBeInTheDocument();
  });

  it('has role="alert" by default', () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('allows overriding role', () => {
    render(<Alert role="status">Message</Alert>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('defaults to soft/neutral/md', () => {
    render(<Alert data-testid="alert">Message</Alert>);
    expect(screen.getByTestId('alert')).toHaveClass('bg-neutral-soft-bg', 'p-3');
  });

  it('applies variant and color classes', () => {
    render(
      <Alert data-testid="alert" variant="solid" color="danger">
        Error
      </Alert>,
    );
    expect(screen.getByTestId('alert')).toHaveClass('bg-danger-solid-bg', 'text-danger-solid-color');
  });

  it('renders decorators around the content', () => {
    render(
      <Alert startDecorator={<span data-testid="start">!</span>} endDecorator={<span data-testid="end">x</span>}>
        Content
      </Alert>,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });
});
