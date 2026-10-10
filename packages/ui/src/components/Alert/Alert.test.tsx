import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';
import { AlertTitle } from './AlertTitle';

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

  it('top-aligns the row so decorators stay on the first line', () => {
    render(
      <Alert data-testid="alert" startDecorator={<span data-testid="icon">i</span>}>
        <AlertTitle>Title</AlertTitle>
        <div>Line one</div>
        <div>Line two</div>
      </Alert>,
    );
    expect(screen.getByTestId('alert')).toHaveClass('items-start');
    expect(screen.getByTestId('alert')).not.toHaveClass('items-center');
    const decorator = screen.getByTestId('icon').parentElement!;
    expect(decorator).toHaveClass('min-h-[1lh]', 'items-center', 'flex-none');
  });
});

describe('AlertTitle', () => {
  it('renders a 16px/24px semibold title', () => {
    render(<AlertTitle>Heads up</AlertTitle>);
    expect(screen.getByText('Heads up')).toHaveClass('text-base/6', 'font-semibold');
  });

  it('merges className', () => {
    render(<AlertTitle className="mb-1">Heads up</AlertTitle>);
    expect(screen.getByText('Heads up')).toHaveClass('font-semibold', 'mb-1');
  });
});
