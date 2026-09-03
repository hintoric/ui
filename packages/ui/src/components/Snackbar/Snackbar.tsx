'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { SnackbarProps } from './types';

const SIZE_CLASS = {
  sm: 'gap-2 p-3 text-xs',
  md: 'gap-2.5 p-4 text-sm',
  lg: 'gap-3.5 p-5 text-base',
} as const;

// `--Snackbar-inset` (the gap between the snackbar and the viewport edge)
// scales with size (0.5rem/0.75rem/1rem for sm/md/lg) — confirmed against
// @mui/joy's Snackbar.js source. `center` never gets a left/right inset,
// only the 50%-translate centering.
const VERTICAL_CLASS = {
  sm: { top: 'top-2', bottom: 'bottom-2' },
  md: { top: 'top-3', bottom: 'bottom-3' },
  lg: { top: 'top-4', bottom: 'bottom-4' },
} as const;
const HORIZONTAL_CLASS = {
  sm: { left: 'left-2', center: 'left-1/2 -translate-x-1/2', right: 'right-2' },
  md: { left: 'left-3', center: 'left-1/2 -translate-x-1/2', right: 'right-3' },
  lg: { left: 'left-4', center: 'left-1/2 -translate-x-1/2', right: 'right-4' },
} as const;

// Scope note: this v1 doesn't use Base UI's toast queue/manager (a
// significantly larger API surface for stacking multiple toasts) — a
// single controlled open/onClose Snackbar rendered via a plain portal,
// matching Joy UI's own simpler open/onClose API shape.
export const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(function Snackbar(
  {
    open,
    onClose,
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
    autoHideDuration = null,
    startDecorator,
    endDecorator,
    className,
    children,
    ...props
  },
  ref,
) {
  React.useEffect(() => {
    if (!open || autoHideDuration == null) return undefined;
    const timer = setTimeout(() => onClose?.(), autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, autoHideDuration, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={ref}
      role="status"
      className={cx(
        'fixed z-50 flex min-w-[300px] max-w-[calc(100vw-2rem)] items-center rounded-sm font-body shadow-[var(--shadow-lg)]',
        VERTICAL_CLASS[size][anchorOrigin.vertical],
        HORIZONTAL_CLASS[size][anchorOrigin.horizontal],
        SIZE_CLASS[size],
        SURFACE_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
      <span className="min-w-0 flex-1">{children}</span>
      {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
    </div>,
    document.body,
  );
});
