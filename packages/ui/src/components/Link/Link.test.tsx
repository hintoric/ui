import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('Link', () => {
  it('renders an anchor with children', () => {
    render(<Link href="/x">Go</Link>);
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '/x');
  });

  it('defaults to primary color with hover underline', () => {
    render(<Link href="/x">Go</Link>);
    expect(screen.getByRole('link')).toHaveClass('text-primary-500', 'hover:underline');
  });

  it('applies variant styling with padding when given', () => {
    render(
      <Link href="/x" variant="soft" color="danger">
        Go
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('bg-danger-soft-bg', 'px-1');
  });

  it('supports underline="always" and "none"', () => {
    const { rerender } = render(
      <Link href="/x" underline="always">
        Go
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('underline');
    rerender(
      <Link href="/x" underline="none">
        Go
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveClass('no-underline');
  });

  it('renders decorators', () => {
    render(
      <Link href="/x" startDecorator={<span data-testid="s" />}>
        Go
      </Link>,
    );
    expect(screen.getByTestId('s')).toBeInTheDocument();
  });
});
