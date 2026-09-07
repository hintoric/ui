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
  const [query, setQuery] = React.useState('');
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
      inputValue={query}
      onInputChange={setQuery}
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
