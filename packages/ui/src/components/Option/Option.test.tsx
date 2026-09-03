import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';
import { Option } from './Option';

describe('Option', () => {
  it('renders its children as the option label', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Choose one">
        <Option value="a">Alpha</Option>
      </Select>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('does not fire selection when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select placeholder="Choose one" onChange={onChange}>
        <Option value="a" disabled>
          Alpha
        </Option>
      </Select>,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Alpha' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks the currently selected option', async () => {
    const user = userEvent.setup();
    render(
      <Select value="a" placeholder="Choose one">
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
      </Select>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false');
  });

  it('moves the highlighted attribute with arrow-key navigation', async () => {
    const user = userEvent.setup();
    render(
      <Select placeholder="Choose one">
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
      </Select>,
    );
    await user.click(screen.getByRole('combobox'));
    const alpha = await screen.findByRole('option', { name: 'Alpha' });
    const beta = screen.getByRole('option', { name: 'Beta' });

    expect(alpha).not.toHaveAttribute('data-highlighted');
    expect(beta).not.toHaveAttribute('data-highlighted');

    await user.keyboard('{ArrowDown}');

    expect(alpha).toHaveAttribute('data-highlighted');
    expect(beta).not.toHaveAttribute('data-highlighted');

    await user.keyboard('{ArrowDown}');

    expect(beta).toHaveAttribute('data-highlighted');
    expect(alpha).not.toHaveAttribute('data-highlighted');
  });
});
