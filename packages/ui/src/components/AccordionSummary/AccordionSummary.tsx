'use client';
import * as React from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { cx } from '../../utils/cx';
import { UnfoldIcon } from '../../internal/svg-icons/UnfoldIcon';
import type { AccordionSummaryProps } from './types';

// Confirmed against @mui/joy's AccordionSummary.js AND Accordion.js source:
// neither the Accordion item's own root nor AccordionSummary ever apply
// `theme.variants[variant][color]` — that styling is exclusive to
// AccordionDetails. So unlike every other variant/color-aware trigger in
// this library, AccordionSummary intentionally does NOT read the Accordion's
// variant/color from context; it's always a plain neutral hover surface.
export const AccordionSummary = React.forwardRef<HTMLButtonElement, AccordionSummaryProps>(function AccordionSummary(
  { indicator, className, children, ...props },
  ref,
) {
  // The focus-visible ring is not decoration: without it the trigger fell back
  // to the browser's 1px default outline where Joy renders 2px, because Joy's
  // summary is a StyledListItemButton and inherits that component's ring while
  // ours is a bare BaseAccordion.Trigger. Measured 2026-09-07. Same treatment
  // and inset offset as our own ListItemButton, which is the component Joy's
  // summary is built from.
  return (
    <BaseAccordion.Header className="m-0">
      <BaseAccordion.Trigger
        ref={ref}
        className={cx(
          'group flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-[inherit] border-none bg-transparent px-3 py-2 text-left font-body font-medium text-neutral-plain-color transition-colors hover:bg-neutral-plain-hover-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500',
          className,
        )}
        {...props}
      >
        <span className="min-w-0 flex-1">{children}</span>
        <span className="inline-flex items-center text-xl text-ink-icon transition-transform duration-200 group-data-[panel-open]:rotate-180">
          {indicator ?? <UnfoldIcon />}
        </span>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
});
