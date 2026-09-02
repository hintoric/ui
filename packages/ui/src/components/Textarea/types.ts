import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TextareaProps
  extends Omit<React.ComponentPropsWithoutRef<'textarea'>, 'color' | 'size'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
