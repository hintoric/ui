'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';

const CloseIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export type ModalCloseProps = Omit<React.ComponentPropsWithoutRef<'button'>, 'color'>;

export const ModalClose = React.forwardRef<HTMLButtonElement, ModalCloseProps>(function ModalClose(
  { className, children, 'aria-label': ariaLabel = 'Close', ...props },
  ref,
) {
  return (
    <BaseDialog.Close
      ref={ref}
      aria-label={ariaLabel}
      className={cx(
        'absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full text-sm transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        INTERACTIVE_COLOR_CLASSES.plain.neutral,
        className,
      )}
      {...props}
    >
      {children ?? <CloseIcon />}
    </BaseDialog.Close>
  );
});
