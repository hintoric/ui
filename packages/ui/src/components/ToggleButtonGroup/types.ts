import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ToggleButtonGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange' | 'value' | 'defaultValue'> {
  variant?: JoyVariant;
  color?: JoyColor;
  orientation?: 'horizontal' | 'vertical';
  spacing?: number | string;
  disabled?: boolean;
  /** Buttons whose `value` prop is included here render as selected. */
  value?: unknown[];
  defaultValue?: unknown[];
  onChange?: (event: React.MouseEvent, value: unknown[]) => void;
}
