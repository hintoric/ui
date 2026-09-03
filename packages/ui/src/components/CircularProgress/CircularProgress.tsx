'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { CIRCULAR_PROGRESS_VARS, CIRCULAR_PROGRESS_SIZE } from './circularProgressColors';
import type { CircularProgressProps } from './types';

export const CircularProgress = React.forwardRef<HTMLSpanElement, CircularProgressProps>(function CircularProgress(
  {
    variant = 'soft',
    color = 'primary',
    size = 'md',
    determinate = false,
    value = determinate ? 0 : 25,
    thickness: thicknessProp,
    className,
    children,
    ...props
  },
  ref,
) {
  const { size: boxSize, thickness: defaultThickness } = CIRCULAR_PROGRESS_SIZE[size];
  const thickness = thicknessProp ?? defaultThickness;
  const radius = (boxSize - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);
  const { track, progress } = CIRCULAR_PROGRESS_VARS[variant][color];

  return (
    <span
      ref={ref}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: boxSize, height: boxSize }}
      {...props}
    >
      <svg
        width={boxSize}
        height={boxSize}
        viewBox={`0 0 ${boxSize} ${boxSize}`}
        className={cx(!determinate && 'animate-spin')}
      >
        <circle cx={boxSize / 2} cy={boxSize / 2} r={radius} fill="none" stroke={track} strokeWidth={thickness} />
        <circle
          cx={boxSize / 2}
          cy={boxSize / 2}
          r={radius}
          fill="none"
          stroke={progress}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${boxSize / 2} ${boxSize / 2})`}
        />
      </svg>
      {children && <span className="absolute inset-0 flex items-center justify-center">{children}</span>}
    </span>
  );
});
