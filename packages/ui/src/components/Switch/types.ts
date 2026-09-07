import type * as React from 'react';
import type { JoyColor } from '../../utils/colorVariantClasses';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'onChange' | 'color'> {
  color?: JoyColor;
  name?: string;
  /**
   * Renders a FormLabel above the switch. Unlike Checkbox and Radio, Switch
   * has no inline label of its own — Joy's own API leaves that to the
   * decorators — so this goes through the shell's FormLabel, associated by
   * htmlFor.
   */
  label?: React.ReactNode;
  /** Renders a FormHelperText below the field. A field error replaces it while one is pending. */
  helperText?: React.ReactNode;
  /** Forces the error look. OR-ed with the bound field's own error state. */
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}
