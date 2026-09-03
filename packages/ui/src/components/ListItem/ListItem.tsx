'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ListItemProps = React.ComponentPropsWithoutRef<'li'>;

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, ...props },
  ref,
) {
  return (
    <li
      ref={ref}
      className={cx('flex min-h-9 items-center gap-2.5 rounded-[inherit] px-3 py-1', className)}
      {...props}
    />
  );
});
