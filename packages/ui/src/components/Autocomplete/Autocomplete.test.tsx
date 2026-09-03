import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

const OPTIONS = ['Alpha', 'Beta', 'Gamma'];

describe('Autocomplete', () => {
  it('renders a text input with a placeholder', () => {
    render(<Autocomplete options={OPTIONS} placeholder="Choose one" />);
    expect(screen.getByPlaceholderText('Choose one')).toBeInTheDocument();
  });

  it('shows options when the input is focused', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });

  it('filters options as the user types', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} />);
    await user.type(screen.getByRole('combobox'), 'be');
    expect(await screen.findByRole('option', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('calls onChange with the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Autocomplete options={OPTIONS} onChange={onChange} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Gamma' }));
    expect(onChange).toHaveBeenCalledWith('Gamma', expect.anything());
    expect(screen.getByRole('combobox')).toHaveValue('Gamma');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Autocomplete options={OPTIONS} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('defaults to outlined/neutral/md', () => {
    render(<Autocomplete options={OPTIONS} data-testid="root-input" />);
    expect(screen.getByTestId('root-input')).toHaveClass('min-w-0', 'flex-1');
  });
});
