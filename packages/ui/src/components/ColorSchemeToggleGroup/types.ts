import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { ColorSchemeLabels } from '../../internal/colorScheme';

export interface ColorSchemeToggleGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'onChange' | 'value' | 'defaultValue'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /** Partially overrides the English defaults `System` / `Light` / `Dark`. */
  labels?: ColorSchemeLabels;
  /** Hides the per-segment icon, leaving text only. */
  icons?: boolean;
}
