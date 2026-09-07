import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '../Form';
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

  it('calls onChange with a real ChangeEvent whose target is the input element', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="name" name="email" onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'name' });
    await userEvent.type(input, 'x');

    const event = onChange.mock.calls.at(-1)?.[0];
    // The fake event this replaces carried only target.value, which is why
    // react-hook-form's register() could never resolve the field.
    expect(event.target).toBe(input);
    expect(event.target.name).toBe('email');
    expect(event.target.value).toBe('x');
    expect(typeof event.preventDefault).toBe('function');
  });

  it('works with react-hook-form register()', async () => {
    const seen: Record<string, unknown>[] = [];
    function Probe() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } });
      seen.push(form.watch());
      return <Input aria-label="email" {...form.register('email')} />;
    }
    render(<Probe />);
    await userEvent.type(screen.getByRole('textbox', { name: 'email' }), 'a@b.de');
    expect(seen.at(-1)).toEqual({ email: 'a@b.de' });
  });
});

describe('Input inside a Form', () => {
  it('binds its initial value from defaultValues', () => {
    render(
      <Form defaultValues={{ email: 'a@b.de' }} onSubmit={vi.fn()}>
        <Input name="email" label="E-Mail" />
      </Form>,
    );
    expect(screen.getByLabelText('E-Mail')).toHaveValue('a@b.de');
  });

  it('writes changes back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <Input name="email" label="E-Mail" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('E-Mail'), 'x@y.de');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'x@y.de' });
  });

  it('shows the zod message as helper text and marks the field invalid', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: 'nope' }}
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" helperText="wird nicht veröffentlicht" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));

    const input = screen.getByLabelText('E-Mail');
    expect(await screen.findByText('keine E-Mail')).toBeInTheDocument();
    expect(screen.queryByText('wird nicht veröffentlicht')).not.toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('keine E-Mail').id);
  });

  it('validates on blur when the form asks for it', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: '' }}
        mode="onBlur"
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" />
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('E-Mail'), 'nope');
    await userEvent.tab();
    expect(await screen.findByText('keine E-Mail')).toBeInTheDocument();
  });

  it('turns danger when the bound field has an error', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().email('keine E-Mail') })}
        defaultValues={{ email: 'nope' }}
        onSubmit={vi.fn()}
      >
        <Input name="email" label="E-Mail" />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    await screen.findByText('keine E-Mail');
    expect(screen.getByLabelText('E-Mail').parentElement).toHaveClass(
      'border-danger-outlined-border',
    );
  });
});

describe('Input outside a Form', () => {
  it('stays uncontrolled and unwrapped with a name but no form', () => {
    const { container } = render(<Input aria-label="frei" name="email" />);
    // No FormControl wrapper appears: the <span> input wrapper is the root.
    expect(container.firstElementChild?.tagName).toBe('SPAN');
    expect(screen.getByRole('textbox', { name: 'frei' })).toHaveAttribute('name', 'email');
  });

  it('still honours a controlled value prop', async () => {
    const onChange = vi.fn();
    render(<Input aria-label="frei" value="fest" onChange={onChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'frei' }), 'x');
    expect(screen.getByRole('textbox', { name: 'frei' })).toHaveValue('fest');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders label and helper text without a form', () => {
    render(<Input name="x" label="Titel" helperText="Hinweis" />);
    expect(screen.getByLabelText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Hinweis')).toBeInTheDocument();
  });
});
