'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export interface CardContentProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(function CardContent(
  { orientation = 'vertical', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('z-10 flex grow gap-1', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
      {...props}
    />
  );
});
