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
      // `px-0 py-1.5`, not `p-1`: Joy's MenuList inherits its padding from the
      // StyledList underneath, which renders 6px vertical and 0 horizontal.
      // Measured against real @mui/joy 2026-09-07 — ours was 4px all round.
      // Note this differs from our Menu (the portalled popup), which is 4px
      // all round and matches Joy's Menu; the two components genuinely differ
      // in Joy too, so do not "harmonise" them.
      className={cx('m-0 list-none overflow-auto rounded-sm px-0 py-1.5 font-body', SURFACE_COLOR_CLASSES[variant][color], className)}
      {...props}
    />
  );
});
