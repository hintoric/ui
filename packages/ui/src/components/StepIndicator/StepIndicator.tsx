'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { StepperContext } from '../Stepper/StepperContext';
import type { StepIndicatorProps } from './types';

// `theme.variants[variant][color]` applied directly (no surface fallback,
// same shape as Avatar/STATIC_COLOR_CLASSES) — confirmed against @mui/joy's
// StepIndicator.js source. Defaults to soft/neutral independently of
// whatever's passed to the enclosing <Stepper> (which has no variant/color
// of its own to inherit from). Sized via Stepper's own `size` context
// (--StepIndicator-size: 20/24/28px for sm/md/lg).
const SIZE_CLASS = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const;

export const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(function StepIndicator(
  { variant = 'soft', color = 'neutral', className, children, ...props },
  ref,
) {
  const size = React.useContext(StepperContext);

  return (
    <div
      ref={ref}
      className={cx(
        // Deliberately no font-weight: Joy's StepIndicator.js sets none, so it
        // inherits 400. Ours used to force `font-medium`, rendering 500 where Joy
        // renders 400 (measured 2026-09-07).
        'inline-flex shrink-0 items-center justify-center rounded-[50%] font-body text-base/[1.5]',
        SIZE_CLASS[size],
        STATIC_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
