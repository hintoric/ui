import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface LinearProgressProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  determinate?: boolean;
  value?: number;
  thickness?: number;
}
