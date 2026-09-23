import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Fully rounded ends instead of Joy's `radius.sm` corners. Not a Joy prop:
   * Joy reaches the same shape through `sx={{ borderRadius: 'xl' }}`, and this
   * library has no `sx`. Pick it for a button that sits next to a pill-shaped
   * neighbour — a `FloatingBar`, a search field with rounded ends — where a
   * square corner would read as the odd one out.
   */
  pill?: boolean;
  loading?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
}
