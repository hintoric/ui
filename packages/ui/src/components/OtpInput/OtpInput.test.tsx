import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Form } from '../Form';
import { FormControl } from '../FormControl';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';
import { OtpInput } from './OtpInput';

const slots = () => screen.getAllByRole('textbox');

describe('OtpInput', () => {
  it('renders six slots: the first named after the field, the rest by position', () => {
    render(<OtpInput aria-label="Code" />);
    expect(slots()).toHaveLength(6);
    // Base UI's convention: entering the field announces its name, and only
    // the slots after it are "Character n of m".
    expect(slots()[0]).toHaveAccessibleName('Code');
    expect(screen.getByRole('textbox', { name: 'Character 2 of 6' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Character 6 of 6' })).toBeInTheDocument();
  });

  it('honours length and a translated slotLabel', () => {
    render(<OtpInput aria-label="Code" length={4} slotLabel={(i, n) => `Ziffer ${i + 1} von ${n}`} />);
    expect(slots()).toHaveLength(4);
    expect(screen.getByRole('textbox', { name: 'Ziffer 4 von 4' })).toBeInTheDocument();
  });

  it('gives every slot the Input pill look and its focus ring', () => {
    render(<OtpInput aria-label="Code" color="success" />);
    for (const slot of slots()) {
      expect(slot).toHaveClass('rounded-sm', 'text-center');
      expect(slot).toHaveClass('focus-within:shadow-[inset_0_0_0_2px_var(--color-success-500)]');
    }
  });

  it('moves along as the user types and reports the whole code', async () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    render(<OtpInput aria-label="Code" length={4} onChange={onChange} onComplete={onComplete} />);
    await userEvent.click(slots()[0]);
    await userEvent.keyboard('1234');
    expect(onChange).toHaveBeenLastCalledWith('1234');
    expect(onComplete).toHaveBeenCalledWith('1234');
    expect(slots().map((s) => (s as HTMLInputElement).value)).toEqual(['1', '2', '3', '4']);
  });

  it('rejects letters in the default numeric mode', async () => {
    const onChange = vi.fn();
    render(<OtpInput aria-label="Code" onChange={onChange} />);
    await userEvent.click(slots()[0]);
    await userEvent.keyboard('a');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('spreads a pasted code across the slots', async () => {
    const onComplete = vi.fn();
    render(<OtpInput aria-label="Code" onComplete={onComplete} />);
    await userEvent.click(slots()[0]);
    await userEvent.paste('482913');
    expect(onComplete).toHaveBeenCalledWith('482913');
  });

  it('marks the group invalid and the slots danger with error', () => {
    render(<OtpInput aria-label="Code" error />);
    expect(screen.getByRole('group', { name: 'Code' })).toHaveAttribute('aria-invalid', 'true');
    expect(slots()[0]).toHaveClass('border-danger-outlined-border');
  });

  it('takes disabled from a surrounding FormControl', () => {
    render(
      <FormControl disabled>
        <OtpInput aria-label="Code" />
      </FormControl>,
    );
    for (const slot of slots()) expect(slot).toBeDisabled();
  });

  it('names the first slot and the group with label, and describes the group', () => {
    render(<OtpInput label="Bestätigungscode" helperText="Per SMS gesendet" />);
    expect(slots()[0]).toHaveAccessibleName('Bestätigungscode');
    const group = screen.getByRole('group', { name: 'Bestätigungscode' });
    expect(group).toHaveAttribute('aria-describedby', screen.getByText('Per SMS gesendet').id);
  });

  it('leaves a half-typed code to the form schema instead of the browser', () => {
    // Base UI's hidden input carries pattern="\d{6}", which would block the
    // submit natively before zod ever ran. Bound fields drop it.
    const { container } = render(
      <Form defaultValues={{ code: '12' }} onSubmit={vi.fn()}>
        <OtpInput name="code" label="Code" />
      </Form>,
    );
    expect(container.querySelector('form')!.checkValidity()).toBe(true);
  });

  it('still filters by validationType when bound', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ code: '' }} onSubmit={onSubmit}>
        <OtpInput name="code" label="Code" length={3} />
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(slots()[0]);
    await userEvent.keyboard('1a2b3');
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit.mock.calls[0][0]).toEqual({ code: '123' });
  });

  it('submits the code as one string under its name', () => {
    const { container } = render(<OtpInput aria-label="Code" name="code" defaultValue="123456" />);
    expect(container.querySelector('input[name="code"]')).toHaveValue('123456');
  });
});

describe('OtpInput field matrix', () => {
  runFieldMatrix({
    name: 'code',
    render: (props) => <OtpInput {...props} length={4} />,
    schema: z.object({ code: z.string().length(4, 'Code unvollständig') }),
    message: 'Code unvollständig',
    validDefaults: { code: '1234' },
    invalidDefaults: { code: '12' },
    expectInitialValue: () => {
      expect(slots().map((s) => (s as HTMLInputElement).value)).toEqual(['1', '2', '3', '4']);
    },
    edit: async () => {
      // Typing into a filled slot replaces its character.
      await userEvent.click(slots()[3]);
      await userEvent.keyboard('9');
    },
    expectedAfterEdit: { code: '1239' },
    control: () => screen.getByRole('group', { name: MATRIX_LABEL }),
    focusTarget: () => slots()[0],
    standaloneRootTag: 'DIV',
    renderStandalone: () => <OtpInput aria-label="frei" name="code" />,
  });
});
