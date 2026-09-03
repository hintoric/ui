import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface LinkProps extends Omit<React.ComponentPropsWithoutRef<'a'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  underline?: 'none' | 'hover' | 'always';
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  disabled?: boolean;
}
