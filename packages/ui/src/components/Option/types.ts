import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface OptionProps<Value = string> extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'value' | 'children'> {
  variant?: JoyVariant;
  color?: JoyColor;
  value: Value;
  disabled?: boolean;
  children?: React.ReactNode;
}
