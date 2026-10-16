import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { FormControl } from '../FormControl';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';
import { NumberInput } from './NumberInput';

// Base UI's number field formats with Intl, so the expected strings below pin
// the locale rather than relying on whatever the test runner happens to use.
const LOCALE = 'en-US';

describe('NumberInput', () => {
  it('renders a textbox carrying the formatted default value', () => {
    render(<NumberInput aria-label="Anzahl" defaultValue={1234} locale={LOCALE} />);
    expect(screen.getByRole('textbox', { name: 'Anzahl' })).toHaveValue('1,234');
  });

  it('wraps the field in the same pill classes as Input', () => {
    render(<NumberInput aria-label="Anzahl" />);
    const pill = screen.getByRole('textbox', { name: 'Anzahl' }).parentElement;
    expect(pill).toHaveClass('border-neutral-outlined-border', 'bg-surface', 'rounded-sm');
    expect(pill).toHaveClass('focus-within:shadow-[inset_0_0_0_2px_var(--color-primary-500)]');
  });

  it('steps with the + and − buttons and reports numbers, not strings', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Anzahl" defaultValue={2} step={2} onChange={onChange} locale={LOCALE} />);
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(onChange).toHaveBeenLastCalledWith(4);
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    await userEvent.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByRole('textbox', { name: 'Anzahl' })).toHaveValue('0');
  });

  it('clamps stepping to min and max', async () => {
    render(<NumberInput aria-label="Anzahl" defaultValue={9} max={10} locale={LOCALE} />);
    const plus = screen.getByRole('button', { name: 'Increase' });
    await userEvent.click(plus);
    await userEvent.click(plus);
    expect(screen.getByRole('textbox', { name: 'Anzahl' })).toHaveValue('10');
  });

  it('reports null once the field is cleared', async () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label="Anzahl" defaultValue={5} onChange={onChange} />);
    await userEvent.clear(screen.getByRole('textbox', { name: 'Anzahl' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('lets the button labels be translated', () => {
    render(<NumberInput aria-label="Anzahl" incrementLabel="Erhöhen" decrementLabel="Verringern" />);
    expect(screen.getByRole('button', { name: 'Erhöhen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verringern' })).toBeInTheDocument();
  });

  it('hides the buttons with stepper={false}', () => {
    render(<NumberInput aria-label="Anzahl" stepper={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the buttons out of the tab order, like a native number input', () => {
    render(<NumberInput aria-label="Anzahl" />);
    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAttribute('tabindex', '-1');
    }
  });

  it('renders decorators inside the pill', () => {
    render(<NumberInput aria-label="Gewicht" startDecorator={<span data-testid="start" />} endDecorator="kg" />);
    const pill = screen.getByRole('textbox', { name: 'Gewicht' }).parentElement!;
    expect(pill).toContainElement(screen.getByTestId('start'));
    expect(pill).toHaveTextContent('kg');
  });

  it('forwards a ref to the visible input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<NumberInput aria-label="Anzahl" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Anzahl' }));
  });

  it('turns danger and sets aria-invalid with error', () => {
    render(<NumberInput aria-label="Anzahl" error />);
    const input = screen.getByRole('textbox', { name: 'Anzahl' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.parentElement).toHaveClass('border-danger-outlined-border');
  });

  it('takes disabled from a surrounding FormControl, buttons included', () => {
    render(
      <FormControl disabled>
        <NumberInput aria-label="Anzahl" />
      </FormControl>,
    );
    expect(screen.getByRole('textbox', { name: 'Anzahl' })).toBeDisabled();
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });

  it('names the input with label and describes it with helperText', () => {
    render(<NumberInput label="Personen" helperText="Höchstens 8" />);
    const input = screen.getByLabelText('Personen');
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('Höchstens 8').id);
  });
});

describe('NumberInput field matrix', () => {
  runFieldMatrix({
    name: 'guests',
    render: (props) => <NumberInput {...props} locale={LOCALE} />,
    schema: z.object({ guests: z.number().max(8, 'zu viele') }),
    message: 'zu viele',
    validDefaults: { guests: 2 },
    invalidDefaults: { guests: 12 },
    expectInitialValue: () => {
      expect(screen.getByLabelText(MATRIX_LABEL)).toHaveValue('2');
    },
    edit: async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    },
    expectedAfterEdit: { guests: 3 },
    control: () => screen.getByLabelText(MATRIX_LABEL),
    standaloneRootTag: 'DIV',
    renderStandalone: () => <NumberInput aria-label="frei" name="guests" />,
  });
});
