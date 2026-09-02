'use client';
import * as React from 'react';
import { Sheet } from '../Sheet/Sheet';
import { cx } from '../../utils/cx';
import type { CardProps } from './types';

export const Card = React.forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'outlined', color = 'neutral', className, ...props },
  ref,
) {
  return (
    <Sheet
      ref={ref}
      variant={variant}
      color={color}
      className={cx('flex flex-col gap-2 rounded-md p-4', className)}
      {...props}
    />
  );
});
