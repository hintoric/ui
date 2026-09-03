import type * as React from 'react';

export interface StepperProps extends React.ComponentPropsWithoutRef<'ol'> {
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}
