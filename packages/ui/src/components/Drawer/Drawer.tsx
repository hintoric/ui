'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { DRAWER_HORIZONTAL_SIZE, DRAWER_VERTICAL_SIZE } from './drawerSizes';
import type { DrawerProps } from './types';

const ANCHOR_CLASS = {
  left: 'top-0 left-0 h-full data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full',
  right: 'top-0 right-0 h-full data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full',
  top: 'top-0 left-0 w-full data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full',
  bottom: 'bottom-0 left-0 w-full data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full',
} as const;

// Joy UI's DrawerContent applies `theme.typography[body-${size}]` (fontSize
// only — the typography's own `color` is overridden by the variant/color
// spread that follows it), plus a constant `boxShadow: theme.shadow.md`
// regardless of variant. Confirmed against @mui/joy's Drawer.js source.
const SIZE_CLASS = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const;

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  { open, onClose, anchor = 'left', variant = 'plain', color = 'neutral', size = 'md', className, children, ...props },
  ref,
) {
  const isHorizontal = anchor === 'left' || anchor === 'right';
  const dimension = isHorizontal
    ? { width: `min(100vw, ${DRAWER_HORIZONTAL_SIZE[size]})`, height: '100%' }
    : { height: `min(100vh, ${DRAWER_VERTICAL_SIZE[size]})`, width: '100vw' };

  return (
    <BaseDialog.Root open={open} onOpenChange={(next) => !next && onClose?.()}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/50 transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup
          ref={ref}
          className={cx(
            'fixed z-50 flex flex-col gap-2 p-4 font-body shadow-[var(--shadow-md)] outline-none transition-transform',
            ANCHOR_CLASS[anchor],
            SIZE_CLASS[size],
            SURFACE_COLOR_CLASSES[variant][color],
            className,
          )}
          style={dimension}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
});
