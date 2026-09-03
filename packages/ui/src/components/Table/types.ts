import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export type TableBorderAxis = 'none' | 'x' | 'xBetween' | 'y' | 'yBetween' | 'both' | 'bothBetween';

export interface TableProps extends Omit<React.ComponentPropsWithoutRef<'table'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  borderAxis?: TableBorderAxis;
  hoverRow?: boolean;
  noWrap?: boolean;
  stickyHeader?: boolean;
}
