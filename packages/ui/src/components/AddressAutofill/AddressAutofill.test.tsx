import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';
import { AddressAutofill } from './AddressAutofill';
import { fetchAddressSuggestions } from './addressApi';
import type { AddressSuggestion } from './types';

vi.mock('./addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));
const mockedFetch = vi.mocked(fetchAddressSuggestions);

const BERLIN: AddressSuggestion = {
  postalCode: '10115',
  city: 'Berlin',
  street: 'Ackerstr.',
  borough: 'Mitte',
  suburb: 'Mitte',
};

const CONTENT_PROPS = {
  belowMinLengthContent: 'Mindestens 2 Zeichen eingeben.',
  loadingContent: 'Suche läuft…',
  noResultsContent: 'Keine Adresse gefunden.',
  errorContent: 'Adressen konnten nicht geladen werden.',
};

describe('AddressAutofill', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when rendered outside a <Form>', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(<AddressAutofill name="address" label="Adresse" {...CONTENT_PROPS} />),
    ).toThrow();
    consoleError.mockRestore();
  });

  it('shows belowMinLengthContent below minQueryLength', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'a');
    expect(await screen.findByText(CONTENT_PROPS.belowMinLengthContent)).toBeInTheDocument();
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('fetches at minQueryLength, after debounceMs, and selecting an option writes the value into the form', async () => {
    mockedFetch.mockResolvedValue([BERLIN]);
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form onSubmit={onSubmit}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
        <button type="submit">ok</button>
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    await user.click(await screen.findByRole('option', { name: /Ackerstr\./ }));
    await user.click(screen.getByRole('button', { name: 'ok' }));
    expect(onSubmit).toHaveBeenCalledWith({ address: BERLIN }, expect.anything());
  });

  it('shows loadingContent while a request is in flight and there are no suggestions yet', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    expect(await screen.findByText(CONTENT_PROPS.loadingContent)).toBeInTheDocument();
  });

  it('shows noResultsContent when a search completes with zero matches', async () => {
    mockedFetch.mockResolvedValue([]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'qqqqq');
    expect(await screen.findByText(CONTENT_PROPS.noResultsContent)).toBeInTheDocument();
  });

  it('shows errorContent and clears the list when the request fails', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(screen.getByLabelText('Adresse'), 'acker');
    expect(await screen.findByText(CONTENT_PROPS.errorContent)).toBeInTheDocument();
  });

  it('keeps existing suggestions visible while a new query is loading', async () => {
    mockedFetch.mockResolvedValueOnce([BERLIN]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" label="Adresse" debounceMs={10} {...CONTENT_PROPS} />
      </Form>,
    );
    const input = screen.getByLabelText('Adresse');
    await user.type(input, 'acker');
    await screen.findByRole('option', { name: /Ackerstr\./ });

    mockedFetch.mockReturnValue(new Promise(() => {}));
    await user.type(input, 'x');
    await waitFor(() => expect(screen.getByRole('option', { name: /Ackerstr\./ })).toBeInTheDocument());
  });
});
