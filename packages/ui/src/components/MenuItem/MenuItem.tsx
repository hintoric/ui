'use client';
import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS, HOVER_BG_CLASS, STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { MenuItemProps } from './types';

// Extends ListItemButton's own styling (StyledListItemButton, no surface
// fallback), same base as Select's Option — but unlike Option, MenuItem's
// `selected` is a plain caller-controlled boolean (menu items are actions,
// not a value-select list; there's no aria-selected/value-matching
// mechanism). Confirmed against @mui/joy's MenuItem.js source.
export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { variant = 'plain', color = 'neutral', selected = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <BaseMenu.Item
      ref={ref}
      disabled={disabled}
      className={(state) =>
        cx(
          'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[inherit] border border-transparent px-3 py-1 text-left transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
          STATIC_COLOR_CLASSES[variant][color],
          state.highlighted && !selected && HOVER_BG_CLASS[variant][color],
          selected && ACTIVE_BG_CLASS[variant][color],
          className,
        )
      }
      {...props}
    >
      {children}
    </BaseMenu.Item>
  );
});
