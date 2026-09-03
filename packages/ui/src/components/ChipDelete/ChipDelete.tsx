'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { CancelIcon } from '../../internal/svg-icons/CancelIcon';
import type { ChipDeleteProps } from './types';

// Scope note: Joy UI's ChipDelete reads its size from the parent Chip's
// --Chip-deleteSize CSS variable (which our Chip doesn't define) — this v1
// is a standalone small round delete button instead of a context-aware slot.
export const ChipDelete = React.forwardRef<HTMLButtonElement, ChipDeleteProps>(function ChipDelete(
  { variant = 'plain', color = 'neutral', onDelete, onKeyDown, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onDelete}
      onKeyDown={(event) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          onDelete?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
        }
        onKeyDown?.(event);
      }}
      className={cx(
        // Literal 50% radius, not Tailwind's `rounded-full` (huge computed
        // px number) — same lesson as Avatar/Chip/Badge.
        'inline-flex size-5 shrink-0 items-center justify-center rounded-[50%] p-0 text-sm transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        INTERACTIVE_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      {children ?? <CancelIcon />}
    </button>
  );
});
