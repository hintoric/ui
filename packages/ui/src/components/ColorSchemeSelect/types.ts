import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeSelectProps
  extends Omit<
    React.ComponentPropsWithoutRef<'button'>,
    'color' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
}
