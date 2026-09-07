import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../Form';
import { FormField } from './FormField';

describe('FormField', () => {
  it('hands field and fieldState to its render prop', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ farbe: '#fff' }} onSubmit={onSubmit}>
        <FormField name="farbe" label="Farbe">
          {({ field, id }) => (
            <input
              id={id}
              value={String(field.value)}
              onChange={(e) => field.onChange(e.target.value)}
            />
          )}
        </FormField>
        <button type="submit">ok</button>
      </Form>,
    );
    const input = screen.getByLabelText('Farbe');
    expect(input).toHaveValue('#fff');
    await userEvent.clear(input);
    await userEvent.type(input, '#000');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ farbe: '#000' });
  });

  it('renders the zod message as helper text and reports invalid to the render prop', async () => {
    render(
      <Form
        schema={z.object({ farbe: z.string().startsWith('#', 'muss mit # beginnen') })}
        defaultValues={{ farbe: 'rot' }}
        onSubmit={vi.fn()}
      >
        <FormField name="farbe" label="Farbe" helperText="Hex oder Name">
          {({ field, fieldState, id }) => (
            <input
              id={id}
              data-invalid={fieldState.invalid}
              value={String(field.value)}
              onChange={() => {}}
            />
          )}
        </FormField>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText('muss mit # beginnen')).toBeInTheDocument();
    expect(screen.queryByText('Hex oder Name')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Farbe')).toHaveAttribute('data-invalid', 'true');
  });

  it('offers a describedBy that points at the message', async () => {
    render(
      <Form
        schema={z.object({ farbe: z.string().startsWith('#', 'muss mit # beginnen') })}
        defaultValues={{ farbe: 'rot' }}
        onSubmit={vi.fn()}
      >
        <FormField name="farbe" label="Farbe">
          {({ field, id, describedBy }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              value={String(field.value)}
              onChange={() => {}}
            />
          )}
        </FormField>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    const message = await screen.findByText('muss mit # beginnen');
    expect(screen.getByLabelText('Farbe')).toHaveAttribute('aria-describedby', message.id);
  });

  it('binds its label to the control by htmlFor', () => {
    render(
      <Form defaultValues={{ farbe: '' }} onSubmit={vi.fn()}>
        <FormField name="farbe" label="Farbe">
          {({ field, id }) => <input id={id} value={String(field.value)} onChange={() => {}} />}
        </FormField>
      </Form>,
    );
    expect(screen.getByLabelText('Farbe')).toBeInTheDocument();
  });

  it('renders the bare control when there is no label and no helper text', () => {
    const { container } = render(
      <Form defaultValues={{ farbe: '' }} onSubmit={vi.fn()}>
        <FormField name="farbe">
          {({ field, id }) => (
            <input id={id} aria-label="farbe" value={String(field.value)} onChange={() => {}} />
          )}
        </FormField>
      </Form>,
    );
    // Straight inside the <form>, with no FormControl wrapper added.
    expect(container.querySelector('form')!.firstElementChild?.tagName).toBe('INPUT');
  });
});
