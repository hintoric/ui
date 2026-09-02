import type * as React from 'react';

export type StackSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;

export interface StackProps extends React.ComponentPropsWithoutRef<'div'> {
  component?: React.ElementType;
  direction?: 'row' | 'column';
  spacing?: StackSpacing;
}
