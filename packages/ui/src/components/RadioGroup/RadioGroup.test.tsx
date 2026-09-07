import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';
import { Radio } from '../Radio';

import { z } from 'zod';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';

describe('RadioGroup', () => {
  it('renders as a vertical flex column by default', () => {
    render(
      <RadioGroup data-testid="group">
        <Radio aria-label="a" value="a" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('flex-col');
  });

  it('switches to a horizontal row', () => {
    render(
      <RadioGroup data-testid="group" orientation="horizontal">
        <Radio aria-label="a" value="a" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('group')).toHaveClass('flex-row');
  });

  it('calls onChange with the newly selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup onChange={onChange}>
        <Radio aria-label="a" value="a" />
        <Radio aria-label="b" value="b" />
      </RadioGroup>,
    );
    await user.click(screen.getByRole('radio', { name: 'b' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('respects a controlled value', () => {
    render(
      <RadioGroup value="b">
        <Radio aria-label="a" value="a" />
        <Radio aria-label="b" value="b" />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'b' })).toBeChecked();
  });
});

describe('RadioGroup field matrix', () => {
  runFieldMatrix({
    name: 'rolle',
    render: (props) => (
      <RadioGroup {...props}>
        <Radio value="admin" label="Admin" />
        <Radio value="leser" label="Leser" />
      </RadioGroup>
    ),
    schema: z.object({ rolle: z.enum(['admin', 'leser'], { message: 'Rolle wählen' }) }),
    message: 'Rolle wählen',
    validDefaults: { rolle: 'leser' },
    invalidDefaults: {},
    expectInitialValue: () => {
      expect(screen.getByRole('radio', { name: 'Leser' })).toBeChecked();
    },
    edit: async () => {
      await userEvent.click(screen.getByRole('radio', { name: 'Admin' }));
    },
    expectedAfterEdit: { rolle: 'admin' },
    // The group is named by aria-labelledby, so the labelled element IS the
    // radiogroup itself.
    control: () => screen.getByRole('radiogroup', { name: MATRIX_LABEL }),
    // The group carries the aria attributes but cannot take focus; a radio
    // inside it can, and React's onBlur sees the focusout bubble up.
    focusTarget: () => screen.getByRole('radio', { name: 'Admin' }),
    standaloneRootTag: 'DIV',
    renderStandalone: () => (
      <RadioGroup name="rolle">
        <Radio value="admin" label="Admin" />
      </RadioGroup>
    ),
  });
});
