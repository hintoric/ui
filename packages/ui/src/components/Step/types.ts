import type * as React from 'react';

export interface StepProps extends React.ComponentPropsWithoutRef<'li'> {
  orientation?: 'horizontal' | 'vertical';
  active?: boolean;
  completed?: boolean;
  disabled?: boolean;
}
