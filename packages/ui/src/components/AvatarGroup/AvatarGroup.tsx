'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { AvatarGroupProps } from './types';

const GAP_CLASS = {
  sm: '[&>*:not(:first-child)]:-ml-1.5 [&>*]:shadow-[0_0_0_2px_var(--color-surface)]',
  md: '[&>*:not(:first-child)]:-ml-2 [&>*]:shadow-[0_0_0_2px_var(--color-surface)]',
  lg: '[&>*:not(:first-child)]:-ml-2.5 [&>*]:shadow-[0_0_0_4px_var(--color-surface)]',
} as const;

// Overlapping avatars with a "ring" gap against the page background —
// negative margin + box-shadow ring, applied via sibling selectors rather
// than Joy UI's CSS-variable-based AvatarGroupContext (Avatar doesn't read
// group context in this v1). Confirmed against @mui/joy's AvatarGroup.js.
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { size = 'md', className, ...props },
  ref,
) {
  return <div ref={ref} className={cx('flex', GAP_CLASS[size], className)} {...props} />;
});
