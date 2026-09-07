'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { FormControlContext } from '../FormControl/FormControlContext';
import type { FormLabelProps } from './types';

export const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(function FormLabel(
  { required: requiredProp, className, children, ...props },
  ref,
) {
  const formControl = React.useContext(FormControlContext);
  const required = requiredProp ?? formControl?.required ?? false;
  return (
    <label
      ref={ref}
      className={cx(
        'flex select-none flex-wrap items-center gap-0.5 font-body text-sm font-medium',
        // Joy sets --FormLabel-color from theme.variants.plainDisabled (which
        // resolves to neutral-400) for a disabled FormControl, and leaves it
        // at the primary ink otherwise. Note it does NOT recolour the label on
        // error — only the helper text carries that. Confirmed against
        // @mui/joy's FormControl.js.
        formControl?.disabled ? 'text-neutral-plain-disabled-color' : 'text-ink-primary',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-danger-500">&nbsp;*</span>}
    </label>
  );
});
