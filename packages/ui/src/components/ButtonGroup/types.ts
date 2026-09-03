import type * as React from 'react';

export interface ButtonGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: number | string;
  disabled?: boolean;
}
