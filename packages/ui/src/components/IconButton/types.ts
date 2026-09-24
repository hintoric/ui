import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface IconButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /**
   * A circle instead of a rounded square. Not a Joy prop — see `Button`'s
   * `pill` for why it exists. `FloatingBarButton` is this circle with a
   * selected state on top.
   */
  pill?: boolean;
}
