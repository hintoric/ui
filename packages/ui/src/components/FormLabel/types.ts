import type * as React from 'react';

export interface FormLabelProps extends React.ComponentPropsWithoutRef<'label'> {
  required?: boolean;
}
