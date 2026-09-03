import type * as React from 'react';
import type { JoyColor } from '../../utils/colorVariantClasses';

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'onChange' | 'color'> {
  color?: JoyColor;
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
