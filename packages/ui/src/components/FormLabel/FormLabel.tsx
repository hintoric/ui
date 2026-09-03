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
      className={cx('flex select-none flex-wrap items-center gap-0.5 font-body text-sm font-medium text-ink-primary', className)}
      {...props}
    >
      {children}
      {required && <span className="text-danger-500">&nbsp;*</span>}
    </label>
  );
});
