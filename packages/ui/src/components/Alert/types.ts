import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}
