'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { FormHelperTextProps } from './types';

export const FormHelperText = React.forwardRef<HTMLDivElement, FormHelperTextProps>(function FormHelperText(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('flex items-center gap-0.5 font-body text-sm text-ink-tertiary', className)}
      {...props}
    />
  );
});
