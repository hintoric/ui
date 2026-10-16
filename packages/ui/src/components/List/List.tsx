'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ListProps extends React.ComponentPropsWithoutRef<'ul'> {
  component?: React.ElementType;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

// Padding is vertical only. Joy's vertical List pads the block axis and
// leaves the inline axis at 0, so its rows span the list's full width;
// ours used `p-1`/`p-1.5`, which inset every row by 4-6px per side.
// Measured 2026-09-07 against real @mui/joy: a ListItem in a 320px-wide list
// came out 312px for us against Joy's 320px. Same shape of divergence as
// MenuList's padding, found in the same pass.
//
// Per size, measured against real @mui/joy 2026-10-16: no gap between rows
// (ours had gap-1/1.5, Joy stacks them flush); block padding 4/6/8px; and
// Joy's body-sm/-lg line-height 1.5 (21/27px), which Tailwind's bare
// text-sm/-lg (20/28px) miss. The `--list-item-*` variables are what Joy's
// `--ListItem-*` cascade does: ListItem and ListItemButton read them, falling
// back to the md values when used outside a List.
const SIZE_CLASS = {
  sm: 'px-0 py-1 text-sm/[1.5] [--list-item-min-h:2rem] [--list-item-py:3px] [--list-item-px:0.5rem] [--list-item-gap:0.5rem]',
  md: 'px-0 py-1.5 text-base [--list-item-min-h:2.25rem] [--list-item-py:0.25rem] [--list-item-px:0.75rem] [--list-item-gap:0.625rem]',
  lg: 'px-0 py-2 text-lg/[1.5] [--list-item-min-h:2.75rem] [--list-item-py:0.375rem] [--list-item-px:1rem] [--list-item-gap:0.75rem]',
} as const;

export const List = React.forwardRef<HTMLUListElement, ListProps>(function List(
  { component: Component = 'ul', variant, color, size = 'md', orientation = 'vertical', className, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(
        'm-0 flex list-none rounded-sm font-body',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        SIZE_CLASS[size],
        variant && color ? SURFACE_COLOR_CLASSES[variant][color] : '',
        className,
      )}
      {...props}
    />
  );
});
