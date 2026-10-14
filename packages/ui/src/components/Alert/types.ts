import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface AlertProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Before the content, on its first line. Left out, the alert shows the icon
   * for its colour (`AlertIcon`); `null` shows none.
   */
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}
