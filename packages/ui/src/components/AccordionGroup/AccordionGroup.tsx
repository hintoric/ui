'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { AccordionGroupProps } from './types';

// Joy UI's AccordionGroup is a pure styling wrapper (a divider between
// items, size/variant context for children) — it does NOT coordinate shared
// open/close state across its Accordion children; each Accordion manages its
// own expanded state independently. Confirmed against @mui/joy's
// AccordionGroup.js source.
export const AccordionGroup = React.forwardRef<HTMLDivElement, AccordionGroupProps>(function AccordionGroup(
  { disableDivider = false, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        'flex flex-col',
        !disableDivider && '[&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-divider',
        className,
      )}
      {...props}
    />
  );
});
