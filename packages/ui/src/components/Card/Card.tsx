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
      className={cx(
        'relative flex flex-col gap-2 rounded-lg p-4',
        // The default Card is borderless on the light canvas and keeps its
        // outline in dark; the token carries the scheme, the border keeps its
        // width so nothing moves when the scheme flips.
        variant === 'outlined' && color === 'neutral' && 'border-card-outlined-neutral-border',
        className,
      )}
      {...props}
    />
  );
});
