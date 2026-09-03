'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ListItemContentProps = React.ComponentPropsWithoutRef<'div'>;

export const ListItemContent = React.forwardRef<HTMLDivElement, ListItemContentProps>(function ListItemContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx('min-w-0 flex-1', className)} {...props} />;
});
