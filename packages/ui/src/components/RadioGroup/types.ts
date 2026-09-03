import type * as React from 'react';

export interface RadioGroupProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'value' | 'defaultValue' | 'onChange'> {
  name?: string;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  orientation?: 'horizontal' | 'vertical';
}
