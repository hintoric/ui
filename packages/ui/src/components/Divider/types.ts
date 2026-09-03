import type * as React from 'react';

export interface DividerProps extends React.ComponentPropsWithoutRef<'hr'> {
  orientation?: 'horizontal' | 'vertical';
  children?: React.ReactNode;
}
