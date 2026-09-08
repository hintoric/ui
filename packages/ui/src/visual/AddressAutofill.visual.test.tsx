import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddressAutofill } from '../components/AddressAutofill';
import { Autocomplete } from '../components/Autocomplete';
import { Form } from '../components/Form';
import { fetchAddressSuggestions } from '../components/AddressAutofill/addressApi';
import { settleTransitions } from './helpers';

vi.mock('../components/AddressAutofill/addressApi', () => ({ fetchAddressSuggestions: vi.fn() }));
const mockedFetch = vi.mocked(fetchAddressSuggestions);

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;

const CONTENT_PROPS = {
  belowMinLengthContent: 'Type at least 2 characters',
  loadingContent: 'Loading…',
  noResultsContent: 'No addresses found',
  errorContent: "Couldn't load suggestions",
};

describe('AddressAutofill visual parity with Autocomplete', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches a bare Autocomplete's computed styles`, async () => {
        mockedFetch.mockResolvedValue([]);
        render(
          <Form onSubmit={vi.fn()}>
            <AddressAutofill
              name="address"
              variant={variant}
              color={color}
              data-testid={`address-${variant}-${color}`}
              {...CONTENT_PROPS}
            />
          </Form>,
        );
        render(
          <Autocomplete
            options={[]}
            variant={variant}
            color={color}
            data-testid={`autocomplete-${variant}-${color}`}
          />,
        );

        const addressInput = page.getByTestId(`address-${variant}-${color}`).element();
        const autocompleteInput = page.getByTestId(`autocomplete-${variant}-${color}`).element();
        const addressRoot = addressInput.closest('div') as HTMLElement;
        const autocompleteRoot = autocompleteInput.closest('div') as HTMLElement;

        const addressStyle = getComputedStyle(addressRoot);
        const autocompleteStyle = getComputedStyle(autocompleteRoot);

        expect(addressStyle.backgroundColor).toBe(autocompleteStyle.backgroundColor);
        expect(addressStyle.color).toBe(autocompleteStyle.color);
        expect(addressStyle.borderRadius).toBe(autocompleteStyle.borderRadius);
        expect(addressStyle.minHeight).toBe(autocompleteStyle.minHeight);

        await expect(addressRoot).toMatchScreenshot(`address-autofill-${variant}-${color}`);
      });
    }
  }

  it('below-min-length state', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" data-testid="address-below-min" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.click(page.getByTestId('address-below-min').element());
    // Screenshotting the popup text itself, not the input — the input's
    // data-testid lands on the bare <input> (same as Autocomplete's own),
    // which never shows this message; the message renders in the portal-ed
    // Combobox.Empty popup instead.
    const message = await screen.findByText(CONTENT_PROPS.belowMinLengthContent);
    await expect(message).toMatchScreenshot('address-autofill-below-min-length');
  });

  it('loading state', async () => {
    mockedFetch.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-loading" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-loading').element(), 'acker');
    const message = await screen.findByText(CONTENT_PROPS.loadingContent);
    await expect(message).toMatchScreenshot('address-autofill-loading');
  });

  it('no-results state', async () => {
    mockedFetch.mockResolvedValue([]);
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-no-results" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-no-results').element(), 'qqqqq');
    const message = await screen.findByText(CONTENT_PROPS.noResultsContent);
    await expect(message).toMatchScreenshot('address-autofill-no-results');
  });

  it('error state', async () => {
    mockedFetch.mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" debounceMs={10} data-testid="address-error" {...CONTENT_PROPS} />
      </Form>,
    );
    await user.type(page.getByTestId('address-error').element(), 'acker');
    const message = await screen.findByText(CONTENT_PROPS.errorContent);
    await expect(message).toMatchScreenshot('address-autofill-error');
  });

  it('focus ring matches Autocomplete', async () => {
    mockedFetch.mockResolvedValue([]);
    render(
      <Form onSubmit={vi.fn()}>
        <AddressAutofill name="address" data-testid="address-focus" {...CONTENT_PROPS} />
      </Form>,
    );
    render(<Autocomplete options={[]} data-testid="autocomplete-focus" />);

    // Direct .focus()/.blur(), captured one at a time — this file's own
    // established pattern (see Button.visual.test.tsx, Checkbox.visual.test.tsx):
    // only one element can hold focus at once, so both computed styles must be
    // read before moving on to the next, not both read at the end.
    const addressInput = page.getByTestId('address-focus').element() as HTMLElement;
    const autocompleteInput = page.getByTestId('autocomplete-focus').element() as HTMLElement;

    addressInput.focus();
    await settleTransitions();
    const addressBoxShadow = getComputedStyle(addressInput.closest('div') as HTMLElement).boxShadow;
    addressInput.blur();

    autocompleteInput.focus();
    await settleTransitions();
    const autocompleteBoxShadow = getComputedStyle(autocompleteInput.closest('div') as HTMLElement).boxShadow;
    autocompleteInput.blur();

    expect(addressBoxShadow).toBe(autocompleteBoxShadow);
  });
});
