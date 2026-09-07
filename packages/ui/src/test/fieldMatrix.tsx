import * as React from 'react';
import { expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ZodType } from 'zod';
import { Form } from '../components/Form';

/** The label every field in the matrix is rendered with. */
export const MATRIX_LABEL = 'Feld';

export interface FieldMatrixConfig {
  /** The form field path, e.g. 'email'. */
  name: string;
  /** Renders the field under test. `props` must be spread onto it. */
  render: (props: { name: string; label: string; helperText?: string }) => React.ReactElement;
  /** A schema that REJECTS invalidDefaults with exactly `message`. */
  schema: ZodType<Record<string, unknown>, Record<string, unknown>>;
  message: string;
  validDefaults: Record<string, unknown>;
  invalidDefaults: Record<string, unknown>;
  /**
   * Asserts that `validDefaults` actually reached the control. Per-field
   * because "shows its value" means a different thing for a text box, a
   * checkbox and a slider — and asserting only that the label rendered would
   * pass even if nothing were bound at all.
   */
  expectInitialValue: () => void;
  /** Performs one user edit on the rendered field. */
  edit: () => Promise<void>;
  /** The form value expected after `edit` ran once against validDefaults. */
  expectedAfterEdit: Record<string, unknown>;
  /** Returns the element that should carry aria-invalid / aria-describedby. */
  control: () => HTMLElement;
  /**
   * The element that actually takes focus, when that is not the one carrying
   * the aria attributes. A radiogroup is named by aria-labelledby but is not
   * focusable — the radios inside it are; a Slider's attributes sit on its
   * control while the thumb is what focuses. Defaults to `control`.
   */
  focusTarget?: () => HTMLElement;
  /**
   * The element carrying aria-invalid, when it is not the one carrying
   * aria-describedby. Only Slider needs this: Base UI's Slider.Thumb forwards
   * aria-describedby and aria-labelledby down to the hidden range input that
   * holds role="slider", but keeps aria-invalid on the thumb wrapper. Two
   * nodes, not one — and not something this library can redirect through Base
   * UI's API. Defaults to `control`.
   */
  invalidTarget?: () => HTMLElement;
  /** Root tag name the field renders with no label and no helper text. */
  standaloneRootTag: string;
  /** Renders the field with a name but no <Form> around it. */
  renderStandalone: () => React.ReactElement;
}

/**
 * The six checks the spec requires of every bound field. Point 6 is the
 * important one: it is the test for the promise that this whole change is
 * additive, i.e. that a `name` alone does nothing outside a <Form>.
 */
export function runFieldMatrix(config: FieldMatrixConfig): void {
  const label = MATRIX_LABEL;

  it('1. binds its initial value from defaultValues', () => {
    render(
      <Form defaultValues={config.validDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label })}
      </Form>,
    );
    config.expectInitialValue();
  });

  it('2. writes a change back into the form values', async () => {
    const onSubmit = vi.fn();
    render(
      <Form defaultValues={config.validDefaults} onSubmit={onSubmit}>
        {config.render({ name: config.name, label })}
        <button type="submit">ok</button>
      </Form>,
    );
    await config.edit();
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0]).toEqual(config.expectedAfterEdit);
  });

  it('3. validates on blur when the form asks for it', async () => {
    render(
      <Form
        schema={config.schema}
        defaultValues={config.invalidDefaults}
        mode="onBlur"
        onSubmit={vi.fn()}
      >
        {config.render({ name: config.name, label })}
      </Form>,
    );
    (config.focusTarget ?? config.control)().focus();
    await userEvent.tab();
    expect(await screen.findByText(config.message)).toBeInTheDocument();
  });

  it('4. shows the zod message as helper text, replacing its own', async () => {
    render(
      <Form schema={config.schema} defaultValues={config.invalidDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label, helperText: 'eigener Hinweis' })}
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    expect(await screen.findByText(config.message)).toBeInTheDocument();
    expect(screen.queryByText('eigener Hinweis')).not.toBeInTheDocument();
  });

  it('5. marks the control invalid and points aria-describedby at the message', async () => {
    render(
      <Form schema={config.schema} defaultValues={config.invalidDefaults} onSubmit={vi.fn()}>
        {config.render({ name: config.name, label })}
        <button type="submit">ok</button>
      </Form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'ok' }));
    const message = await screen.findByText(config.message);
    expect((config.invalidTarget ?? config.control)()).toHaveAttribute('aria-invalid', 'true');
    expect(config.control()).toHaveAttribute('aria-describedby', message.id);
  });

  it('6. is unchanged outside a Form, even with a name', () => {
    const { container } = render(config.renderStandalone());
    expect(container.firstElementChild?.tagName).toBe(config.standaloneRootTag);
  });
}
