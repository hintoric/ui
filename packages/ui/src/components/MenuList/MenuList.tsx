'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { MenuListProps } from './types';

// A plain styled list — unlike Menu (the actual popup), MenuList has no
// boxShadow of its own and falls back to `background.surface` (not
// `.popup`) when unstyled, matching Sheet/Card/Chip's own fallback.
// Confirmed against @mui/joy's MenuList.js source. Used for a nested/
// grouped list of items inside a Menu, not as the popup itself.
export const MenuList = React.forwardRef<HTMLUListElement, MenuListProps>(function MenuList(
  { variant = 'plain', color = 'neutral', className, ...props },
  ref,
) {
  return (
    <ul
      ref={ref}
      className={cx('m-0 list-none overflow-auto rounded-sm p-1 font-body', SURFACE_COLOR_CLASSES[variant][color], className)}
      {...props}
    />
  );
});
