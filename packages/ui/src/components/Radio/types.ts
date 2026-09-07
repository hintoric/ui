import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface RadioProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'onChange' | 'color' | 'value'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  value?: unknown;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  disableIcon?: boolean;
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
}
