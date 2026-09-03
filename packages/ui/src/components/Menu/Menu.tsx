'use client';
import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { MENU_COLOR_CLASSES } from './menuVariants';
import type { MenuProps } from './types';

// Confirmed against @mui/joy's Menu.js source: boxShadow.md, radius.sm,
// background.popup fallback — the same formula Select's own listbox uses,
// but (unlike Select's listbox) Menu takes real variant/color props.
export const Menu = React.forwardRef<HTMLDivElement, MenuProps>(function Menu(
  { variant = 'outlined', color = 'neutral', size = 'md', className, children, ...props },
  ref,
) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side="bottom" align="start" sideOffset={4} className="z-50 outline-none">
        <BaseMenu.Popup
          ref={ref}
          className={cx(
            'z-50 max-h-[40vh] min-w-[max-content] overflow-auto rounded-sm p-1 font-body shadow-[var(--shadow-md)] outline-none',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg',
            MENU_COLOR_CLASSES[variant][color],
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
});
