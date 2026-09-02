import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders a native button with its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies the solid/primary classes by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-solid-bg');
  });

  it('applies outlined/danger classes when requested', () => {
    render(
      <Button variant="outlined" color="danger">
        Delete
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('border-danger-outlined-border');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders startDecorator and endDecorator around the children', () => {
    render(
      <Button
        startDecorator={<span data-testid="start">S</span>}
        endDecorator={<span data-testid="end">E</span>}
      >
        Click me
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toContainElement(screen.getByTestId('start'));
    expect(button).toContainElement(screen.getByTestId('end'));
  });

  it('forwards a ref to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click me</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('shows a pointer cursor (Tailwind v4 Preflight no longer sets this for <button>)', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('cursor-pointer');
  });
});
