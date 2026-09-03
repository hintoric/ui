import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ChipDeleteProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color' | 'onClick'> {
  variant?: JoyVariant;
  color?: JoyColor;
  onDelete?: React.MouseEventHandler<HTMLButtonElement>;
}
