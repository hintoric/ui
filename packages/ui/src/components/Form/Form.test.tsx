import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, useFormContext } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { Form } from './Form';
import type { FormProps } from './types';

const schema = z.object({ email: z.string().min(3, 'zu kurz') });

function NativeField() {
  const { register } = useFormContext<{ email: string }>();
  return <input aria-label="email" {...register('email')} />;
}

describe('Form', () => {
  it('builds its own useForm instance from schema and defaultValues', async () => {
    const onSubmit = vi.fn();
    render(
      <Form schema={schema} defaultValues={{ email: 'a@b.de' }} onSubmit={onSubmit}>
        <NativeField />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'a@b.de' });
  });

  it('does not call onSubmit when the schema rejects, and calls onInvalid instead', async () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    render(
      <Form schema={schema} defaultValues={{ email: 'x' }} onSubmit={onSubmit} onInvalid={onInvalid}>
        <NativeField />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalledTimes(1);
    expect(onInvalid.mock.calls[0][0].email?.message).toBe('zu kurz');
  });

  it('uses a consumer-provided instance instead of its own', async () => {
    const onSubmit = vi.fn();
    // Captured in an effect, not during render: assigning to an outer
    // variable while rendering is a side effect, and react-hooks/globals
    // rightly rejects it.
    const captured: { form?: UseFormReturn<{ email: string }> } = {};
    function Host() {
      const form = useForm<{ email: string }>({ defaultValues: { email: 'c@d.de' } });
      React.useEffect(() => {
        captured.form = form;
      }, [form]);
      return (
        <Form form={form} onSubmit={onSubmit}>
          <NativeField />
          <button type="submit">ok</button>
        </Form>
      );
    }
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'c@d.de' });
    expect(onSubmit.mock.calls[0][1]).toBe(captured.form);
  });

  it('passes the form instance to a render-prop child', () => {
    render(
      <Form schema={schema} defaultValues={{ email: 'a@b.de' }} onSubmit={async () => {}}>
        {({ formState }) => (
          <button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'läuft' : 'ok'}
          </button>
        )}
      </Form>,
    );
    expect(screen.getByRole('button', { name: 'ok' })).toBeInTheDocument();
  });

  it('renders a native form element and forwards form attributes', () => {
    const { container } = render(
      <Form schema={schema} defaultValues={{ email: 'a' }} onSubmit={vi.fn()} noValidate id="f1">
        <span />
      </Form>,
    );
    const form = container.querySelector('form')!;
    expect(form).toHaveAttribute('id', 'f1');
    expect(form).toHaveAttribute('novalidate');
  });

  it('rejects schema together with form at the type level', () => {
    // A structural check rather than a @ts-expect-error on a JSX element:
    // `{} as never` satisfies `form?: never` (never is assignable to never),
    // so the obvious version of this test could never fail. This one breaks
    // the build the moment the union stops being exclusive.
    type Both = {
      schema: typeof schema;
      form: UseFormReturn<{ email: string }>;
      onSubmit: () => void;
      children: null;
    };
    type Verdict = Both extends FormProps<{ email: string }> ? 'assignable' : 'rejected';
    const verdict: Verdict = 'rejected';

    // Counter-check, so the assertion above cannot pass vacuously: the same
    // machinery must say "assignable" for a legal shape. Without this, a
    // `Both` that merely forgot a required prop would also read as rejected.
    type OnlySchema = { schema: typeof schema; onSubmit: () => void; children: null };
    type LegalVerdict = OnlySchema extends FormProps<{ email: string }> ? 'assignable' : 'rejected';
    const legalVerdict: LegalVerdict = 'assignable';

    expect(verdict).toBe('rejected');
    expect(legalVerdict).toBe('assignable');
  });
});
