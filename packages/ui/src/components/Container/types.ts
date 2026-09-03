import type * as React from 'react';

export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;

export interface ContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  component?: React.ElementType;
  maxWidth?: ContainerMaxWidth;
  disableGutters?: boolean;
  fixed?: boolean;
}
