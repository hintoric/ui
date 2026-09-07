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
const SIZE_CLASS = {
  sm: 'gap-1 px-0 py-1 text-sm',
  md: 'gap-1 px-0 py-1 text-base',
  lg: 'gap-1.5 px-0 py-1.5 text-lg',
} as const;

// Scope note: this v1 doesn't cascade --ListItem-* CSS variables down to
// ListItem/ListItemButton children the way Joy UI's List does — each item
// carries its own reasonable md-equivalent defaults instead.
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
