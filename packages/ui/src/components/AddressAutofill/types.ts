import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AddressSuggestion {
  postalCode: string;
  city: string;
  street: string;
  borough: string | null;
  suburb: string | null;
}

export interface AddressAutofillProps
  extends Omit<
    React.ComponentPropsWithoutRef<'input'>,
    'color' | 'size' | 'name' | 'value' | 'defaultValue' | 'onChange'
  > {
  /** The react-hook-form field path. Required — this field always binds to a form. */
  name: string;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Turns a suggestion into display text. @default `${street}, ${postalCode} ${city}` */
  getOptionLabel?: (value: AddressSuggestion) => string;
  /** Characters typed before a search fires. @default 2 */
  minQueryLength?: number;
  /** Debounce between the last keystroke and firing the request, in ms. @default 300 */
  debounceMs?: number;
  /** Passed to the API as the result cap. @default 10 */
  limit?: number;

  /** Shown when fewer than `minQueryLength` characters have been typed. No default — see spec. */
  belowMinLengthContent: React.ReactNode;
  /** Shown while a search request is in flight and there are no suggestions yet. No default. */
  loadingContent: React.ReactNode;
  /** Shown when a search completed with zero matches. No default. */
  noResultsContent: React.ReactNode;
  /** Shown when the search request failed. No default. */
  errorContent: React.ReactNode;

  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}
