import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../../components/Form';
import { textAdapter, checkedAdapter, valueAdapter } from './adapters';
import { useBoundField } from './useBoundField';

// A minimal probe field per adapter shape — the real components are wired in
// later tasks, but the binding core has to be provable on its own.
function TextProbe({ onChange }: { onChange?: React.ChangeEventHandler<HTMLInputElement> }) {
  const { fieldProps, errorMessage } = useBoundField('email', textAdapter, { onChange });
  return (
    <>
      <input aria-label="email" {...(fieldProps as React.ComponentProps<'input'>)} />
      <span data-testid="err">{errorMessage ?? ''}</span>
    </>
  );
}

function CheckedProbe() {
  const { fieldProps } = useBoundField('agb', checkedAdapter, {});
  const p = fieldProps as { checked: boolean; onCheckedChange: (v: boolean) => void };
  return (
    <button type="button" aria-label="agb" aria-pressed={p.checked} onClick={() => p.onCheckedChange(!p.checked)}>
      agb
    </button>
  );
}

function ValueProbe() {
  const { fieldProps } = useBoundField('rolle', valueAdapter, {});
  const p = fieldProps as { value: unknown; onChange: (v: unknown) => void };
  return (
    <button type="button" aria-label="rolle" onClick={() => p.onChange('admin')}>
      {String(p.value)}
    </button>
  );
}

describe('useBoundField', () => {
  it('binds the initial value from defaultValues through the text adapter', () => {
    render(
      <Form defaultValues={{ email: 'a@b.de' }} onSubmit={vi.fn()}>
        <TextProbe />
      </Form>,
    );
    expect(screen.getByLabelText('email')).toHaveValue('a@b.de');
  });

  it('writes typed input back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <TextProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('email'), 'x@y.de');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'x@y.de' });
  });

  it('substitutes an empty string for an undefined value so the input stays controlled', () => {
    render(
      <Form defaultValues={{}} onSubmit={vi.fn()}>
        <TextProbe />
      </Form>,
    );
    expect(screen.getByLabelText('email')).toHaveValue('');
  });

  it("chains the consumer's own onChange after RHF's", async () => {
    const own = vi.fn();
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ email: '' }} onSubmit={onSubmit}>
        <TextProbe onChange={own} />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.type(screen.getByLabelText('email'), 'q');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(own).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'q' });
  });

  it('exposes the zod error message for the bound field', async () => {
    render(
      <Form
        schema={z.object({ email: z.string().min(3, 'zu kurz') })}
        defaultValues={{ email: 'a' }}
        onSubmit={vi.fn()}
      >
        <TextProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByTestId('err')).toHaveTextContent('zu kurz');
  });

  it('maps a boolean through the checked adapter', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ agb: false }} onSubmit={onSubmit}>
        <CheckedProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByLabelText('agb'));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ agb: true });
  });

  it('passes an arbitrary value straight through the value adapter', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <ValueProbe />
        <button type="submit">ok</button>
      </Form>,
    );
    expect(screen.getByLabelText('rolle')).toHaveTextContent('leser');
    await userEvent.click(screen.getByLabelText('rolle'));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ rolle: 'admin' });
  });
});
