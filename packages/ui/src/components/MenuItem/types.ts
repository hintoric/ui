import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface MenuItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  selected?: boolean;
  disabled?: boolean;
}
