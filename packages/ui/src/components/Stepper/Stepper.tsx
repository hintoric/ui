'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { StepperContext } from './StepperContext';
import type { StepperProps } from './types';

// Confirmed against @mui/joy's Stepper.js source: Stepper is a plain `<ol>`
// layout container — no variant/color of its own. `size` and `orientation`
// are threaded to Step/StepIndicator children via context.
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { size = 'md', orientation = 'horizontal', className, children, ...props },
  ref,
) {
  return (
    <ol
      ref={ref}
      className={cx(
        'm-0 box-border flex list-none p-0',
        orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row',
        className,
      )}
      {...props}
    >
      <StepperContext.Provider value={size}>{children}</StepperContext.Provider>
    </ol>
  );
});
