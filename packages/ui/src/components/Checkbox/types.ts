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
  onCheckedChange?: (checked: boolean) => void;
}
