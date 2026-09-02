import type * as React from 'react';

export interface BoxProps extends React.ComponentPropsWithoutRef<'div'> {
  component?: React.ElementType;
}
