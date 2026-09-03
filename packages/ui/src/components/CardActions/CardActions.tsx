'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export interface CardActionsProps extends React.ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'horizontal-reverse' | 'vertical';
}

export const CardActions = React.forwardRef<HTMLDivElement, CardActionsProps>(function CardActions(
  { orientation = 'horizontal', className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        'z-10 flex gap-2.5 pt-3',
        orientation === 'vertical' && 'flex-col',
        orientation === 'horizontal-reverse' && 'flex-row-reverse',
        orientation === 'horizontal' && 'flex-row items-center',
        className,
      )}
      {...props}
    />
  );
});
