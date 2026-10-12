import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

/** A rectangle in viewport coordinates, as `getBoundingClientRect()` returns it. */
export interface PopoverAnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PopoverProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'children'> {
  /** Whether the popover is shown. Controlled: close it from `onClose`. */
  open: boolean;
  /** Called on Escape and on a press outside the popover. */
  onClose?: () => void;
  /**
   * The rectangle the popover stands at, in viewport coordinates — a text
   * selection's `range.getBoundingClientRect()`, say. The popover never covers
   * it, and flips to the other side when there is no room.
   */
  anchorRect: PopoverAnchorRect;
  /** The side of the rectangle to prefer. Flips at the edge of the page. Default `bottom`. */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along that side. Default `center`. */
  align?: 'start' | 'center' | 'end';
  /** Gap to the rectangle, in px. Default 8. */
  offset?: number;
  /**
   * `plain` paints nothing of its own, for hosting something that has its own
   * surface, such as a `FloatingBar`. Default `plain`.
   */
  variant?: JoyVariant;
  color?: JoyColor;
  children?: React.ReactNode;
}
