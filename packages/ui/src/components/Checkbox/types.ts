import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'onChange' | 'defaultChecked' | 'checked' | 'color'> {
  name?: string;
  value?: string;
  /** @default undefined — when omitted, Joy UI toggles outlined/solid to signal state */
  variant?: JoyVariant;
  /** @default undefined — when omitted, Joy UI toggles neutral/primary to signal state */
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  disableIcon?: boolean;
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}
