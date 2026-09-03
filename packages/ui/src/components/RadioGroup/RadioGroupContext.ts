import * as React from 'react';

export interface RadioGroupContextValue {
  name?: string;
  value: unknown;
  onChange: (value: unknown) => void;
}

export const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined);
