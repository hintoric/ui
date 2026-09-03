import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface MenuListProps extends Omit<React.ComponentPropsWithoutRef<'ul'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
}
