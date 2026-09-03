'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { DividerProps } from './types';

// Bare Divider renders <hr>; with children Joy UI swaps to <div
// role="separator"> with a text label flanked by two lines (rendered here as
// real ::before/::after pseudo-elements, matching Joy UI's own approach).
// Confirmed against @mui/joy's Divider.js source.
export const Divider = React.forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = 'horizontal', className, children, ...props },
  ref,
) {
  if (children == null) {
    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        className={cx(
          'm-0 shrink-0 self-stretch border-none bg-divider',
          orientation === 'vertical' ? 'h-auto w-px' : 'h-px w-auto',
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role="separator"
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      className={cx(
        'flex items-center self-stretch whitespace-nowrap font-body text-sm text-ink-tertiary',
        'before:h-px before:flex-1 before:bg-divider before:content-[""]',
        'after:h-px after:flex-1 after:bg-divider after:content-[""]',
        orientation === 'vertical'
          ? 'flex-col before:h-full before:w-px before:mb-2 after:h-full after:w-px after:mt-2'
          : 'flex-row before:mr-2 after:ml-2',
        className,
      )}
      {...(props as React.ComponentPropsWithoutRef<'div'>)}
    >
      {children}
    </div>
  );
});
