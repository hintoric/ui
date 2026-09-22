'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS } from '../../utils/colorVariantClasses';
import { IconButton } from '../IconButton/IconButton';
import { FloatingBarContext } from './FloatingBarContext';
import type { FloatingBarButtonProps } from './types';

/**
 * A button inside a FloatingBar: round, and round again when selected.
 *
 * `rounded-full` is the whole point. Selection reuses the variant's persistent
 * "active" background — the same mechanism `ListItemButton` and
 * `ToggleButtonGroup` use for their selected state — rather than switching
 * variant or colour, so the bar stays one surface.
 */
export const FloatingBarButton = React.forwardRef<HTMLButtonElement, FloatingBarButtonProps>(
  function FloatingBarButton({ variant = 'plain', color = 'neutral', size, selected, className, ...props }, ref) {
    const bar = React.useContext(FloatingBarContext);
    return (
      <IconButton
        ref={ref}
        variant={variant}
        color={color}
        size={size ?? bar.size}
        aria-pressed={selected}
        className={cx('rounded-full', selected && ACTIVE_BG_CLASS[variant][color], className)}
        {...props}
      />
    );
  },
);
