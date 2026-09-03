'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { LINEAR_PROGRESS_VARS, LINEAR_PROGRESS_THICKNESS } from './linearProgressColors';
import type { LinearProgressProps } from './types';

export const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(function LinearProgress(
  {
    variant = 'soft',
    color = 'primary',
    size = 'md',
    determinate = false,
    value = determinate ? 0 : 25,
    thickness: thicknessProp,
    className,
    ...props
  },
  ref,
) {
  const thickness = thicknessProp ?? LINEAR_PROGRESS_THICKNESS[size];
  const { track, bar } = LINEAR_PROGRESS_VARS[variant][color];

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={determinate ? Math.round(value) : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('relative box-border flex flex-1 items-center overflow-hidden rounded-[var(--lp-thickness)]', className)}
      style={{ ['--lp-thickness' as string]: `${thickness}px`, minBlockSize: thickness, backgroundColor: track }}
      {...props}
    >
      <div
        className={cx(
          'absolute inset-y-0 left-0 rounded-[inherit]',
          determinate ? '' : 'animate-pulse',
        )}
        style={{
          backgroundColor: bar,
          width: determinate ? `${value}%` : '40%',
        }}
      />
    </div>
  );
});
