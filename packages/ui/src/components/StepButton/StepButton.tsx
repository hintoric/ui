'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { StepButtonProps } from './types';

// A transparent, unstyled-color clickable wrapper around a StepIndicator +
// label — confirmed against @mui/joy's StepButton.js source (no
// variant/color of its own; coloring lives on the child StepIndicator).
export const StepButton = React.forwardRef<HTMLButtonElement, StepButtonProps>(function StepButton(
  { className, children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'inline-flex min-w-0 flex-1 cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left font-body',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
