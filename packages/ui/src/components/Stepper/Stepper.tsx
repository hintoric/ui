'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { StepperContext } from './StepperContext';
import type { StepperProps } from './types';

// Confirmed against @mui/joy's Stepper.js source: Stepper is a plain `<ol>`
// layout container — no variant/color of its own. `size` and `orientation`
// are threaded to Step/StepIndicator children via context.
// Typography lives here, not on StepIndicator. Joy's Stepper applies
// `theme.typography['title-{size}']` to itself (Stepper.js:53-73) and its
// StepIndicator sets none, so the indicator inherits it. Joy's title levels
// are fontSize sm/md/lg with fontWeight md/md/lg and lineHeight sm/md/xs.
//
// Measured 2026-09-07 in a real Stepper + Step composition. An earlier pass
// had "fixed" StepIndicator against a BARE render of Joy's indicator, where
// Joy inherits the page's 400/16px because no Stepper is above it — that
// comparison does not reflect any real usage, and it produced the wrong fix.
// StepIndicator now inherits, as Joy's does.
const SIZE_CLASS = {
  sm: 'text-sm/[1.42858] font-medium',
  md: 'text-base/[1.5] font-medium',
  lg: 'text-lg/[1.33334] font-semibold',
} as const;

export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { size = 'md', orientation = 'horizontal', className, children, ...props },
  ref,
) {
  return (
    <ol
      ref={ref}
      className={cx(
        'm-0 box-border flex list-none p-0 font-body',
        SIZE_CLASS[size],
        orientation === 'vertical' ? 'flex-col gap-3' : 'flex-row',
        className,
      )}
      {...props}
    >
      <StepperContext.Provider value={size}>{children}</StepperContext.Provider>
    </ol>
  );
});
