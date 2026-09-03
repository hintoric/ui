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

const SIZE_CLASS = {
  sm: 'gap-1 p-1 text-sm',
  md: 'gap-1 p-1 text-base',
  lg: 'gap-1.5 p-1.5 text-lg',
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
