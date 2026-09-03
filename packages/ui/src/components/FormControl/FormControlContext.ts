import * as React from 'react';

export interface FormControlContextValue {
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
}

export const FormControlContext = React.createContext<FormControlContextValue | undefined>(undefined);
