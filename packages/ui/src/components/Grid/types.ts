import type * as React from 'react';

export interface GridProps extends React.ComponentPropsWithoutRef<'div'> {
  container?: boolean;
  spacing?: number | string;
  /** Column span out of 12. `true` grows to fill remaining space. */
  xs?: number | boolean;
}
