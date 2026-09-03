import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TabsProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'onChange' | 'defaultValue'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  value?: string | number | null;
  defaultValue?: string | number | null;
  onChange?: (event: React.SyntheticEvent | undefined, value: string | number | null) => void;
}
