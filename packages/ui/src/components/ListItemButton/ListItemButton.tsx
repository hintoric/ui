'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS, INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface ListItemButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> {
  variant?: JoyVariant;
  color?: JoyColor;
  selected?: boolean;
}

// `selected` does NOT switch variant/color (unlike Checkbox's active/
// inactive default pattern) — Joy UI keeps the same variant/color and just
// permanently applies that combination's own "Active" background, the same
// one :active already uses momentarily. Confirmed against @mui/joy's
// ListItemButton.js source (`.selected` styled with `${variant}Active`).
export const ListItemButton = React.forwardRef<HTMLButtonElement, ListItemButtonProps>(function ListItemButton(
  { variant = 'plain', color = 'neutral', selected = false, className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'flex min-h-9 w-full items-center gap-2.5 rounded-[inherit] border border-transparent px-3 py-1 text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500',
        INTERACTIVE_COLOR_CLASSES[variant][color],
        selected && cx(ACTIVE_BG_CLASS[variant][color], 'font-medium'),
        className,
      )}
      {...props}
    />
  );
});
