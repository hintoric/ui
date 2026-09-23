'use client';
import * as React from 'react';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import { cx } from '../../utils/cx';
import { iconButtonVariants } from '../IconButton/iconButtonVariants';
import { FloatingBarContext } from './FloatingBarContext';
import type { FloatingBarMenuButtonProps } from './types';

/**
 * A menu trigger that looks like a `FloatingBarButton`: a circle in the pill,
 * sized by the bar, that opens a `Menu` inside a `Dropdown`.
 *
 * It exists because a `MenuButton` cannot be a `FloatingBarButton`: the one is
 * a Base UI menu trigger, the other a Base UI button, and nesting them makes
 * two buttons of one control. Without this, every "more actions" menu at the
 * end of a bar was a `MenuButton` with `rounded-full` and a width by hand,
 * copied from the last bar that needed one.
 *
 * No `selected`: a trigger is open or closed, and Base UI already says which
 * through `aria-expanded` and `data-popup-open`.
 */
export const FloatingBarMenuButton = React.forwardRef<HTMLButtonElement, FloatingBarMenuButtonProps>(
  function FloatingBarMenuButton({ variant = 'plain', color = 'neutral', size, className, ...props }, ref) {
    const bar = React.useContext(FloatingBarContext);
    return (
      <BaseMenu.Trigger
        ref={ref}
        className={cx(iconButtonVariants({ variant, color, size: size ?? bar.size }), 'rounded-full', className)}
        {...props}
      />
    );
  },
);
