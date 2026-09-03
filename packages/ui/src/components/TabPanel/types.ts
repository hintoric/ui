import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TabPanelProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  value: string | number;
}
