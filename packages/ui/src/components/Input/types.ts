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
}
