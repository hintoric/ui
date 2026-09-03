'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ListSubheaderProps = React.ComponentPropsWithoutRef<'div'>;

export const ListSubheader = React.forwardRef<HTMLDivElement, ListSubheaderProps>(function ListSubheader(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('flex min-h-9 items-center gap-2.5 px-3 font-body text-xs font-medium text-ink-tertiary', className)}
      {...props}
    />
  );
});
