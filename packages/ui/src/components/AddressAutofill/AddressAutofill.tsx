'use client';
import * as React from 'react';
import { Autocomplete } from '../Autocomplete';
import { omitProps, useBoundField, useForkRef, valueAdapter } from '../../internal/form';
import { useAddressSuggestions } from './useAddressSuggestions';
import type { AddressAutofillProps, AddressSuggestion } from './types';

const DEFAULT_MIN_QUERY_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 10;

function defaultGetOptionLabel(value: AddressSuggestion): string {
  return `${value.street}, ${value.postalCode} ${value.city}`;
}

function AddressAutofillComponent(
  {
    name,
    variant,
    color,
    size,
    getOptionLabel = defaultGetOptionLabel,
    minQueryLength = DEFAULT_MIN_QUERY_LENGTH,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    limit = DEFAULT_LIMIT,
    belowMinLengthContent,
    loadingContent,
    noResultsContent,
    errorContent,
    label,
    helperText,
    error,
    disabled,
    placeholder,
    ...rest
  }: AddressAutofillProps,
  ref: React.Ref<HTMLInputElement>,
) {
  // Two states, not one: `inputValue` is whatever text the field visibly
  // shows (updated on every change, whatever the reason); `query` is only
  // what actually drives the search. They diverge exactly once — right after
  // selecting a suggestion, Autocomplete resets the input text to that
  // suggestion's full label ('reset', not 'input'). Without the split,
  // `query` would follow along and immediately re-fire a search for that
  // label text, which is both pointless and (found while testing this
  // end-to-end against the real API) can 500 the API for some label shapes.
  const [inputValue, setInputValue] = React.useState('');
  const [query, setQuery] = React.useState('');
  const handleInputChange = (value: string, reason: 'input' | 'reset' | 'clear') => {
    setInputValue(value);
    if (reason !== 'reset') {
      setQuery(value);
    }
  };

  const { suggestions, isLoading, hasError } = useAddressSuggestions(query, {
    minQueryLength,
    debounceMs,
    limit,
  });

  const { fieldProps, errorMessage } = useBoundField(name, valueAdapter, {});
  const { ref: fieldRef, ...fieldRest } = fieldProps as {
    ref: React.Ref<HTMLInputElement>;
    name: string;
    value: AddressSuggestion | null;
    onChange: (value: AddressSuggestion | null) => void;
    onBlur: () => void;
  };
  // `Autocomplete` self-binds to react-hook-form the moment it sees a `name`
  // inside a <FormProvider> (see AutocompleteRootComponent) — passing this
  // field's own `name` through would register a second, independent binding
  // for the same form value, fighting the one just established above.
  const boundProps = omitProps(fieldRest, ['name']) as {
    value: AddressSuggestion | null;
    onChange: (value: AddressSuggestion | null) => void;
    onBlur: () => void;
  };
  const forkedRef = useForkRef(ref, fieldRef);

  const noOptionsText =
    query.length < minQueryLength ? belowMinLengthContent : hasError ? errorContent : noResultsContent;

  return (
    <Autocomplete<AddressSuggestion>
      {...rest}
      {...boundProps}
      ref={forkedRef}
      options={suggestions}
      getOptionLabel={getOptionLabel}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={isLoading}
      loadingText={loadingContent}
      noOptionsText={noOptionsText}
      filter={null}
      variant={variant}
      color={color}
      size={size}
      label={label}
      helperText={errorMessage ?? helperText}
      error={error || errorMessage != null}
      disabled={disabled}
      placeholder={placeholder}
    />
  );
}

export const AddressAutofill = React.forwardRef(AddressAutofillComponent) as ((
  props: AddressAutofillProps & { ref?: React.Ref<HTMLInputElement> },
) => React.ReactElement) & { displayName?: string };
AddressAutofill.displayName = 'AddressAutofill';
