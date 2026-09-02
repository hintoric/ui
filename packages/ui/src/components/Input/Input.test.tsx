import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders a native input', () => {
    render(<Input aria-label="name" />);
    expect(screen.getByRole('textbox', { name: 'name' })).toBeInTheDocument();
  });

  it('applies outlined/neutral classes to the wrapper by default', () => {
    render(<Input aria-label="name" />);
    const input = screen.getByRole('textbox', { name: 'name' });
    // outlined (like plain) falls back to a surface background in Joy UI,
    // not a transparent one — see INPUT_COLOR_CLASSES.
    expect(input.parentElement).toHaveClass('border-neutral-outlined-border', 'bg-surface', 'cursor-text');
  });

  it('calls onChange with the new value while typing', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="name" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'name' }), 'hi');
    expect(onChange).toHaveBeenCalled();
    const lastEvent = onChange.mock.calls.at(-1)?.[0];
    expect(lastEvent.target.value).toBe('hi');
  });

  it('renders startDecorator and endDecorator inside the wrapper', () => {
    render(
      <Input
        aria-label="name"
        startDecorator={<span data-testid="start" />}
        endDecorator={<span data-testid="end" />}
      />,
    );
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('forwards a ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input aria-label="name" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('uses an inset focus ring, not an outer outline with an offset', () => {
    render(<Input aria-label="name" />);
    const wrapper = screen.getByRole('textbox', { name: 'name' }).parentElement;
    expect(wrapper).toHaveClass('focus-within:shadow-[inset_0_0_0_2px_var(--color-primary-500)]');
    expect(wrapper).not.toHaveClass('focus-within:outline', 'focus-within:outline-offset-2');
  });

  it("maps color='neutral' to a primary-colored focus ring, like Joy UI", () => {
    render(<Input aria-label="name" color="neutral" />);
    const wrapper = screen.getByRole('textbox', { name: 'name' }).parentElement;
    expect(wrapper).toHaveClass('focus-within:shadow-[inset_0_0_0_2px_var(--color-primary-500)]');
  });

  it('gives every other color its own matching focus ring color', () => {
    render(<Input aria-label="name" color="danger" />);
    const wrapper = screen.getByRole('textbox', { name: 'name' }).parentElement;
    expect(wrapper).toHaveClass('focus-within:shadow-[inset_0_0_0_2px_var(--color-danger-500)]');
  });
});
