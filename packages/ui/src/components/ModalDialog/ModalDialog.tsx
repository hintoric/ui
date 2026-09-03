'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { ModalDialogProps } from './types';

const SIZE_CLASS = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const;

// Joy UI's ModalDialog literally extends its own Card styling (same
// SURFACE_COLOR_CLASSES fallback, radius, shadow.md instead of Card's own
// shadow) — confirmed against @mui/joy's ModalDialog.js source
// (`styled(StyledCardRoot, ...)`).
export const ModalDialog = React.forwardRef<HTMLDivElement, ModalDialogProps>(function ModalDialog(
  { variant = 'outlined', color = 'neutral', size = 'md', layout = 'center', className, ...props },
  ref,
) {
  return (
    <BaseDialog.Popup
      ref={ref}
      className={cx(
        'relative flex min-w-[min(calc(100vw-2rem),300px)] flex-col gap-2 rounded-md font-body shadow-[var(--shadow-md)] outline-none transition-[scale,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
        layout === 'fullscreen' && 'h-full w-full rounded-none',
        SIZE_CLASS[size],
        SURFACE_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    />
  );
});
