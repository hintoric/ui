'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { SkeletonProps } from './types';

// text/rectangular radius (2.4px) and circular's literal 50% (not Tailwind's
// `rounded-full`, a huge computed px number) confirmed empirically against
// the real @mui/joy package.
const VARIANT_CLASS = {
  text: 'rounded-[2.4px] w-full',
  circular: 'rounded-[50%]',
  rectangular: 'rounded-[2.4px]',
  overlay: 'absolute inset-0 rounded-[inherit]',
} as const;

// Scope note: Joy UI's "overlay" variant detects and dims an existing host
// element via a shared context; this v1 just positions absolutely to fill
// the nearest positioned ancestor, same as CardCover.
export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'overlay', animation = 'pulse', width, height, className, style, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cx(
        'inline-block bg-neutral-200',
        VARIANT_CLASS[variant],
        animation === 'pulse' && 'animate-pulse',
        className,
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  );
});
