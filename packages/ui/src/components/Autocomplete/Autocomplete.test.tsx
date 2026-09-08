import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from './Autocomplete';

const OPTIONS = ['Alpha', 'Beta', 'Gamma'];

import { z } from 'zod';
import { runFieldMatrix, MATRIX_LABEL } from '../../test/fieldMatrix';

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

  it('shows loadingText in the empty slot while loading and options is empty', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} loading loadingText="Loading…" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Loading…')).toBeInTheDocument();
  });

  it('keeps showing existing options instead of loadingText while loading', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={OPTIONS} loading loadingText="Loading…" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  it('shows noOptionsText when the list is empty and not loading', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} noOptionsText="Nothing here" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Nothing here')).toBeInTheDocument();
  });

  it('defaults noOptionsText to "No options"', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={[]} />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByText('No options')).toBeInTheDocument();
  });

  it('client-filters options against the input by default', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={['Zeta']} />);
    await user.type(screen.getByRole('combobox'), 'nomatch');
    expect(screen.queryByRole('option', { name: 'Zeta' })).not.toBeInTheDocument();
  });

  it('does not client-filter options when filter is null', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={['Zeta']} filter={null} />);
    await user.type(screen.getByRole('combobox'), 'nomatch');
    expect(await screen.findByRole('option', { name: 'Zeta' })).toBeInTheDocument();
  });
});

describe('Autocomplete field matrix', () => {
  runFieldMatrix({
    name: 'stadt',
    render: (props) => <Autocomplete {...props} options={['Berlin', 'Hamburg']} />,
    schema: z.object({ stadt: z.enum(['Berlin', 'Hamburg'], { message: 'Stadt wählen' }) }),
    message: 'Stadt wählen',
    validDefaults: { stadt: 'Berlin' },
    invalidDefaults: {},
    expectInitialValue: () => {
      expect(screen.getByLabelText(MATRIX_LABEL)).toHaveValue('Berlin');
    },
    edit: async () => {
      await userEvent.click(screen.getByLabelText(MATRIX_LABEL));
      await userEvent.click(await screen.findByRole('option', { name: 'Hamburg' }));
    },
    expectedAfterEdit: { stadt: 'Hamburg' },
    control: () => screen.getByLabelText(MATRIX_LABEL),
    // Combobox.Root renders a div, so that is the unwrapped root.
    standaloneRootTag: 'DIV',
    renderStandalone: () => <Autocomplete aria-label="frei" name="stadt" options={['Berlin']} />,
  });
});
