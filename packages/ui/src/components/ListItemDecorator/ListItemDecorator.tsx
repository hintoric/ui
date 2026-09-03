'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ListItemDecoratorProps = React.ComponentPropsWithoutRef<'span'>;

export const ListItemDecorator = React.forwardRef<HTMLSpanElement, ListItemDecoratorProps>(function ListItemDecorator(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx('inline-flex items-center justify-center text-ink-icon', className)}
      {...props}
    />
  );
});
