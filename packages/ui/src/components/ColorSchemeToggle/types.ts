import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ColorSchemeToggleProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
}
