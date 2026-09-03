'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { FormControlContext } from './FormControlContext';
import type { FormControlProps } from './types';

// Scope note: unlike Joy UI's FormControl (which cascades size/disabled/error
// into the actual form field via FormControlContext read by Input/Checkbox/
// etc.), this v1's context only reaches FormLabel/FormHelperText — the field
// itself still needs disabled/error passed to it directly.
export const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(function FormControl(
  { disabled, error, required, orientation = 'vertical', className, ...props },
  ref,
) {
  const value = React.useMemo(() => ({ disabled, error, required }), [disabled, error, required]);
  return (
    <FormControlContext.Provider value={value}>
      <div
        ref={ref}
        className={cx(
          'flex',
          orientation === 'horizontal' ? 'flex-row items-center gap-3' : 'flex-col gap-1.5',
          className,
        )}
        {...props}
      />
    </FormControlContext.Provider>
  );
});
