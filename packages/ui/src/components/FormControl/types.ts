import type * as React from 'react';

export interface FormControlProps extends React.ComponentPropsWithoutRef<'div'> {
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  orientation?: 'horizontal' | 'vertical';
}
