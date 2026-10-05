import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TabProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  value: string | number;
  disabled?: boolean;
  /**
   * Inside a `TabNav` only: what the link renders as — e.g. a router's link
   * component. Defaults to `<a>`. Ignored inside `Tabs`, where a Tab is a
   * `role="tab"` button and a link would be the wrong element.
   */
  component?: React.ElementType;
  /** Inside a `TabNav` only: where the link goes. */
  href?: string;
}
