'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { StepperContext } from '../Stepper/StepperContext';
import type { StepProps } from './types';

// Confirmed against @mui/joy's Step.js source: Step is layout-only (no
// variant/color) — `active`/`completed` are exposed as plain data
// attributes for a caller's own CSS hooks (typically callers instead just
// pass a different variant/color to that Step's own <StepIndicator>
// directly; Step doesn't automate this). `orientation` defaults
// independently to 'horizontal' — it is NOT inherited from <Stepper>,
// matching the same non-inheritance pattern found in Accordion and Tabs.
// The connector line between steps is a `::after` pseudo-element sized from
// Stepper's `size` (via context here; via CSS custom properties in real
// Joy), hidden on the last step.
const CONNECTOR_INSET_CLASS = {
  sm: 'after:mx-1',
  md: 'after:mx-1.5',
  lg: 'after:mx-2',
} as const;

export const Step = React.forwardRef<HTMLLIElement, StepProps>(function Step(
  { orientation = 'horizontal', active, completed, disabled, className, children, ...props },
  ref,
) {
  const size = React.useContext(StepperContext);

  return (
    <li
      ref={ref}
      data-active={active ? '' : undefined}
      data-completed={completed ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      className={cx(
        'flex flex-1 items-center gap-2 last:flex-none',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        'after:block after:flex-1 after:rounded-full after:bg-divider last:after:hidden',
        orientation === 'vertical' ? 'after:w-px' : 'after:h-px',
        CONNECTOR_INSET_CLASS[size],
        disabled && 'opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
});
