import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface SliderProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'defaultValue' | 'onChange'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** `false` hides the filled indicator entirely; the default (`true`) shows it. */
  track?: boolean;
  value?: number | readonly number[];
  defaultValue?: number | readonly number[];
  onChange?: (value: number | number[]) => void;
  onChangeCommitted?: (value: number | number[]) => void;
  name?: string;
}
