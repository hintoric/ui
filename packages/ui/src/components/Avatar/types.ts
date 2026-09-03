import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AvatarProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  srcSet?: string;
  alt?: string;
}
