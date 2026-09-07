import type * as React from 'react';
import type { JoyColor } from '../../utils/colorVariantClasses';

export interface ColorSchemeSwitchProps
  extends Omit<React.ComponentPropsWithoutRef<'span'>, 'color' | 'onChange'> {
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Hides the sun and moon decorators either side of the track. */
  icons?: boolean;
}
