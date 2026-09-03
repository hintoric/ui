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
  onInputChange?: (value: string) => void;
  /** Hides the built-in clear ("x") button. @default false */
  disableClearable?: boolean;
}
