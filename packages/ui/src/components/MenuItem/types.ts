import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface MenuItemProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  selected?: boolean;
  disabled?: boolean;
  /**
   * Whether clicking the item closes the menu. Turn it off for an item that
   * changes what the menu shows — a row that opens a sub-view, a setting
   * whose new value the menu should display — rather than finishing the job.
   *
   * @default true
   */
  closeOnClick?: boolean;
}
