import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { Radio } from './Radio';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';
import { Form } from '../Form';
import { RadioGroup } from '../RadioGroup';

describe('Radio', () => {
  it('renders an unchecked radio standalone', () => {
    render(<Radio aria-label="option" />);
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  it('defaults to outlined/neutral when unchecked', () => {
    render(<Radio aria-label="option" />);
    expect(screen.getByRole('radio')).toHaveClass('border-neutral-outlined-border');
  });

  it('defaults to outlined/primary when checked (variant stays fixed)', () => {
    render(<Radio aria-label="option" defaultChecked />);
    const radio = screen.getByRole('radio');
    expect(radio).toHaveClass('border-primary-outlined-border');
  });

  it('toggles on click standalone and calls onCheckedChange', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Radio aria-label="option" onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('radio'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('keeps an explicit variant/color for both checked and unchecked', () => {
    const { rerender } = render(<Radio aria-label="option" variant="soft" color="danger" />);
    expect(screen.getByRole('radio')).toHaveClass('bg-danger-soft-bg');
    rerender(<Radio aria-label="option" variant="soft" color="danger" defaultChecked />);
    expect(screen.getByRole('radio')).toHaveClass('bg-danger-soft-bg');
  });

  it('renders label text', () => {
    render(<Radio label="Option A" />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('works within a RadioGroup, making options mutually exclusive', async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="a">
        <Radio aria-label="a" value="a" />
        <Radio aria-label="b" value="b" />
      </RadioGroup>,
    );
    const [a, b] = screen.getAllByRole('radio');
    expect(a).toBeChecked();
    expect(b).not.toBeChecked();
    await user.click(b);
    expect(a).not.toBeChecked();
    expect(b).toBeChecked();
  });
});

describe('Radio field matrix (standalone)', () => {
  runFieldMatrix({
    name: 'einzeln',
    render: (props) => <Radio {...props} />,
    schema: z.object({ einzeln: z.literal(true, { message: 'bitte wählen' }) }),
    message: 'bitte wählen',
    validDefaults: { einzeln: false },
    invalidDefaults: { einzeln: false },
    expectInitialValue: () => {
      expect(screen.getByRole('radio', { name: MATRIX_LABEL })).not.toBeChecked();
    },
    edit: async () => {
      await userEvent.click(screen.getByRole('radio', { name: MATRIX_LABEL }));
    },
    expectedAfterEdit: { einzeln: true },
    control: () => screen.getByRole('radio', { name: MATRIX_LABEL }),
    standaloneRootTag: 'DIV',
    renderStandalone: () => <Radio name="einzeln" label="einzeln" />,
  });
});

describe('Radio inside a RadioGroup', () => {
  it('leaves the form path to the group, keeping its string value', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={{ rolle: 'leser' }} onSubmit={onSubmit}>
        <RadioGroup name="rolle">
          <Radio name="rolle" value="admin" label="Admin" />
          <Radio name="rolle" value="leser" label="Leser" />
        </RadioGroup>
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Admin' }));
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    // The group's own binding arrives with RadioGroup; until then the value
    // stays at its default. What matters here is that the Radio has not
    // replaced the string with a boolean of its own.
    expect(typeof onSubmit.mock.calls[0][0].rolle).toBe('string');
  });
});
