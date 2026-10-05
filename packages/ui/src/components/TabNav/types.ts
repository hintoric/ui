import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TabNavProps extends Omit<React.ComponentPropsWithoutRef<'nav'>, 'color'> {
  /** The strip's own variant, like `TabList`'s. */
  variant?: JoyVariant;
  /** The strip's own colour, like `TabList`'s. */
  color?: JoyColor;
  /** Passed down to every `Tab`, like `Tabs`'s. */
  size?: 'sm' | 'md' | 'lg';
  /**
   * The `value` of the `Tab` that stands for the current page — usually
   * derived from the route. That tab gets `aria-current="page"` and the
   * indicator. `null`/no match marks none, and hides the indicator.
   */
  value?: string | number | null;
}
