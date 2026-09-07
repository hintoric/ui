import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface InputProps
  extends Omit<React.ComponentPropsWithoutRef<'input'>, 'color' | 'size' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Renders a FormLabel above the field. Omit it and no wrapper is added. */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /**
   * Forces the error look. OR-ed with the bound field's own error state, so a
   * server-side error can be shown for a field the schema considers valid.
   */
  error?: boolean;
}
