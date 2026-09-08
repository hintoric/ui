import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AutocompleteProps<Value = string>
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'color' | 'value' | 'defaultValue' | 'onChange' | 'size'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** The list of selectable values. Rendered via `itemToStringLabel`/children item matching. */
  options: readonly Value[];
  /**
   * Converts an option value to its display label, for both the input text
   * and the default option rendering. Defaults to `String(value)`.
   */
  getOptionLabel?: (value: Value) => string;
  placeholder?: string;
  startDecorator?: React.ReactNode;
  disabled?: boolean;
  /** The selected value. Use when controlled. */
  value?: Value | null;
  defaultValue?: Value | null;
  onChange?: (value: Value | null) => void;
  /** The raw text in the input. Use when controlled. */
  inputValue?: string;
  /**
   * Called as the raw input text changes. `reason` mirrors `@mui/joy`'s own
   * three-value union (`AutocompleteInputChangeReason`): `'input'` for real
   * typing, `'clear'` for the clear button, `'reset'` for everything else —
   * most commonly the text resetting to a freshly selected option's label. A
   * consumer that re-fetches on every input change should gate that on
   * `reason === 'input'`, otherwise selecting an option immediately re-fires
   * a search for its own label.
   */
  onInputChange?: (value: string, reason: 'input' | 'reset' | 'clear') => void;
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  name?: string;
  /** Hides the built-in clear ("x") button. @default false */
  disableClearable?: boolean;
  /**
   * Shows `loadingText` in the empty-state slot instead of `noOptionsText`,
   * but only while `options` is empty — matches `@mui/joy`'s own
   * `Autocomplete` `loading` prop exactly, including that rule.
   * @default false
   */
  loading?: boolean;
  /** Shown in the empty-state slot while `loading` is true and `options` is empty. @default 'Loading…' */
  loadingText?: React.ReactNode;
  /** Shown in the empty-state slot when `options` is empty and not loading. @default 'No options' */
  noOptionsText?: React.ReactNode;
  /**
   * Passed straight to Base UI's `Combobox.Root`. Pass `null` to disable Base
   * UI's own client-side filtering of `options` against the input text —
   * required whenever `options` already reflects a server-filtered result set
   * for the current query (a debounced remote search), since otherwise Base
   * UI's default text-match filter can hide valid results whose label
   * doesn't literally contain what's currently typed.
   * @default undefined (Base UI's built-in filter)
   */
  filter?: null | ((itemValue: Value, query: string, itemToString?: (itemValue: Value) => string) => boolean);
}
