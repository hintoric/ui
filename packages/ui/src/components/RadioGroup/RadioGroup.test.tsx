import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';
import { Radio } from '../Radio';

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
