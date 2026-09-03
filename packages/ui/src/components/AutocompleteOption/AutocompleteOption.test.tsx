import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from '../Autocomplete';

const OPTIONS = ['Alpha', 'Beta'];

describe('AutocompleteOption', () => {
  it('does not fire selection when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Autocomplete options={OPTIONS} onChange={onChange} getOptionLabel={(v) => v} />);
    await user.click(screen.getByRole('combobox'));
    const option = await screen.findByRole('option', { name: 'Alpha' });
    expect(option).toBeInTheDocument();
  });

  it('marks the currently selected option', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} value="Alpha" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveAttribute('aria-selected', 'false');
  });

  it('moves the highlighted attribute with arrow-key navigation', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    const alpha = await screen.findByRole('option', { name: 'Alpha' });
    const beta = screen.getByRole('option', { name: 'Beta' });

    await user.keyboard('{ArrowDown}');
    expect(alpha).toHaveAttribute('data-highlighted');
    expect(beta).not.toHaveAttribute('data-highlighted');

    await user.keyboard('{ArrowDown}');
    expect(beta).toHaveAttribute('data-highlighted');
    expect(alpha).not.toHaveAttribute('data-highlighted');
  });
});
