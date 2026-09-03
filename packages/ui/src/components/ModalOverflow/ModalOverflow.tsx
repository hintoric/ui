'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ModalOverflowProps = React.ComponentPropsWithoutRef<'div'>;

// Lets a ModalDialog taller than the viewport scroll within the overlay
// instead of being clipped, while keeping it centered. Wrap ModalDialog with
// this when its content can grow tall.
export const ModalOverflow = React.forwardRef<HTMLDivElement, ModalOverflowProps>(function ModalOverflow(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx('flex max-h-full w-full items-center justify-center overflow-y-auto p-4', className)}
      {...props}
    />
  );
});
