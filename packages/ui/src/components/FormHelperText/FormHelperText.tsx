'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { FormControlContext } from '../FormControl/FormControlContext';
import type { FormHelperTextProps } from './types';

// Joy drives this colour from its FormControl through a --FormHelperText-color
// CSS variable: danger[500] in error state, theme.variants.plainDisabled's
// colour (which resolves to neutral-400) when disabled, text.tertiary
// otherwise. Reading the context directly is the same cascade without the
// intermediate variable. Confirmed against @mui/joy's FormControl.js.
const HELPER_COLOR_CLASS = {
  error: 'text-danger-500',
  disabled: 'text-neutral-plain-disabled-color',
  resting: 'text-ink-tertiary',
} as const;

export const FormHelperText = React.forwardRef<HTMLDivElement, FormHelperTextProps>(
  function FormHelperText({ className, ...props }, ref) {
    const formControl = React.useContext(FormControlContext);
    // Disabled wins over error: a field nobody can edit should not shout
    // about being wrong. Matches Joy's own rule order.
    const state = formControl?.disabled ? 'disabled' : formControl?.error ? 'error' : 'resting';
    return (
      <div
        ref={ref}
        className={cx(
          'flex items-center gap-0.5 font-body text-sm',
          HELPER_COLOR_CLASS[state],
          className,
        )}
        {...props}
      />
    );
  },
);
