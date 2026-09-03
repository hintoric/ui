import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TabProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  value: string | number;
  disabled?: boolean;
}
