import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

/** Which edge of the nearest positioned ancestor the bar hugs. */
export type FloatingBarPlacement = 'top' | 'right' | 'bottom' | 'left';

/** Where along that edge it sits. */
export type FloatingBarAlign = 'start' | 'center' | 'end';

export type FloatingBarSize = 'sm' | 'md' | 'lg';

export interface FloatingBarProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  /** Handed down to every FloatingBarButton that does not set its own. */
  size?: FloatingBarSize;
  /** Defaults to the one the placement implies: upright against a side edge, flat against a top or bottom one. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Pins the bar to an edge of the nearest positioned ancestor. Without it the
   * bar is an ordinary flex element and the caller places it.
   */
  placement?: FloatingBarPlacement;
  align?: FloatingBarAlign;
  /** Hangs the bar half over the edge instead of keeping it inside. */
  straddle?: boolean;
}

export interface FloatingBarButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: FloatingBarSize;
  /**
   * Draws the button as active and announces it as pressed. Leave it out for a
   * plain action — a button with no state should not claim one.
   */
  selected?: boolean;
}
