import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';
import { Option } from '../Option';

describe('Select', () => {
  it('renders a placeholder when no value is selected', () => {
    render(
      <Select placeholder="Choose one">
        <Option value="a">A</Option>
        <Option value="b">B</Option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose one');
  });

  it('opens the listbox and selects an option on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select placeholder="Choose one" onChange={onChange}>
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
      </Select>,
    );

    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(onChange).toHaveBeenCalledWith('b', expect.anything());
    expect(screen.getByRole('combobox')).toHaveTextContent('Beta');
  });

  it('renders the label of a controlled value', () => {
    render(
      <Select value="a">
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toHaveTextContent('Alpha');
  });

  it('is disabled when disabled prop is set', () => {
    render(
      <Select disabled placeholder="Choose one">
        <Option value="a">Alpha</Option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('defaults to outlined/neutral/md', () => {
    render(
      <Select placeholder="Choose one" data-testid="trigger">
        <Option value="a">Alpha</Option>
      </Select>,
    );
    expect(screen.getByTestId('trigger')).toHaveClass('text-neutral-outlined-color', 'min-h-9');
  });
});
