import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ButtonGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  /** Passed down to every Button/IconButton in the group that doesn't set its own, as in Joy. */
  variant?: JoyVariant;
  /** Passed down to every Button/IconButton in the group that doesn't set its own, as in Joy. */
  color?: JoyColor;
  /** Passed down to every Button/IconButton in the group that doesn't set its own, as in Joy. */
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  /**
   * Gap between the buttons. A number is a multiple of 8px (Joy's
   * `theme.spacing`), a string is used as-is. 0 connects them.
   */
  spacing?: number | string;
  /** Disables every Button/IconButton in the group that doesn't set its own `disabled`. */
  disabled?: boolean;
}
