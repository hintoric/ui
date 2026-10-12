'use client';
import * as React from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { PopoverProps } from './types';

/**
 * A popup that stands at a rectangle rather than at an element.
 *
 * `Tooltip` and `Menu` hang on the element that triggers them; a text
 * selection is no element, only a rectangle. Base UI's positioner accepts any
 * object with a `getBoundingClientRect`, so the rectangle is handed over as
 * one, and collision handling (flip, shift) is the same as `Menu`'s.
 *
 * Focus stays where it is on open: moving it into the popup would be right for
 * a dialog and wrong here, where the page's own selection is the point.
 */
export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    open,
    onClose,
    anchorRect,
    placement = 'bottom',
    align = 'center',
    offset = 8,
    variant = 'plain',
    color = 'neutral',
    className,
    children,
    ...props
  },
  ref,
) {
  const { x, y, width, height } = anchorRect;
  const anchor = React.useMemo(
    () => ({
      getBoundingClientRect: () => DOMRect.fromRect({ x, y, width, height }),
    }),
    [x, y, width, height],
  );

  return (
    <BasePopover.Root
      open={open}
      modal={false}
      onOpenChange={(next) => {
        if (!next) onClose?.();
      }}
    >
      <BasePopover.Portal>
        <BasePopover.Positioner
          anchor={anchor}
          side={placement}
          align={align}
          sideOffset={offset}
          className="z-50 outline-none"
        >
          <BasePopover.Popup
            ref={ref}
            initialFocus={false}
            finalFocus={false}
            className={cx(
              'rounded-sm font-body outline-none',
              SURFACE_COLOR_CLASSES[variant][color],
              className,
            )}
            {...props}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
});
