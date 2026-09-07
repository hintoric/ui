import type * as React from 'react';

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'value' | 'defaultValue' | 'onChange'> {
  name?: string;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  orientation?: 'horizontal' | 'vertical';
  /**
   * Renders a FormLabel for the group, associated by aria-labelledby — a
   * <label> cannot name a radiogroup.
   */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the group. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  required?: boolean;
}
