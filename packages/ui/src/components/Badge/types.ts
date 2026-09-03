import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface BadgeProps extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  badgeContent?: React.ReactNode;
  max?: number;
  showZero?: boolean;
  invisible?: boolean;
}
