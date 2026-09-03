'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { badgeDotVariants } from './badgeVariants';
import type { BadgeProps } from './types';

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant,
    color,
    size = 'md',
    badgeContent,
    max = 99,
    showZero = false,
    invisible: invisibleProp = false,
    className,
    children,
    ...props
  },
  ref,
) {
  const isZero = badgeContent === 0 || badgeContent === '0';
  const invisible = invisibleProp || (isZero && !showZero) || badgeContent == null;
  const displayContent =
    typeof badgeContent === 'number' && badgeContent > max ? `${max}+` : badgeContent;

  return (
    <span ref={ref} className={cx('relative inline-flex shrink-0 align-middle', className)} {...props}>
      {children}
      <span className={badgeDotVariants({ variant, color, size, invisible })}>{displayContent}</span>
    </span>
  );
});
