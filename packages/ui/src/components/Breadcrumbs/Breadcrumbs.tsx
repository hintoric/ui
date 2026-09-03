'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { BreadcrumbsProps } from './types';

// Uses `body-${size}` directly (sm->14px/md->16px/lg->18px) — unlike Chip/
// Alert/Badge, which shift the mapping down one step (sm->body-xs). Confirmed
// against @mui/joy's Breadcrumbs.js source.
const SIZE_CLASS = {
  sm: 'gap-1 p-2 text-sm',
  md: 'gap-1.5 p-3 text-base',
  lg: 'gap-2 p-4 text-lg',
} as const;

export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { size = 'md', separator = '/', className, children, ...props },
  ref,
) {
  const items = React.Children.toArray(children);
  return (
    <nav ref={ref} aria-label="breadcrumbs" className={cx('font-body text-ink-secondary', SIZE_CLASS[size], className)} {...props}>
      <ol className="m-0 flex flex-wrap items-center gap-[inherit] p-0 list-none">
        {items.map((child, index) => (
          <li key={index} className="flex items-center gap-[inherit]">
            {child}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="text-ink-tertiary">
                {separator}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});
