'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';

export type DialogContentProps = React.ComponentPropsWithoutRef<'p'>;

export const DialogContent = React.forwardRef<HTMLParagraphElement, DialogContentProps>(function DialogContent(
  { className, ...props },
  ref,
) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cx('overflow-auto font-body text-sm text-ink-tertiary', className)}
      {...props}
    />
  );
});
