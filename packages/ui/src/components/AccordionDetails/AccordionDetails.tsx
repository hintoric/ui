'use client';
import * as React from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { AccordionDetailsProps } from './types';

// Animates open/close via Base UI's `--collapsible-panel-height` CSS var
// (its measured content height) instead of Joy's `grid-template-rows: 0fr
// -> 1fr` trick — a simplification that still produces the same smooth
// height transition. AccordionDetails has its OWN independent
// variant/color props defaulting to plain/neutral — it does NOT inherit
// from the enclosing <Accordion>, matching @mui/joy's AccordionDetails.js
// source (its own `variant = 'plain'`/`color = 'neutral'` defaults, read
// from its own props, not from AccordionContext) — plus the padding values
// (halved top, 2.5x bottom, matching ListItem's own vertical spacing).
export const AccordionDetails = React.forwardRef<HTMLDivElement, AccordionDetailsProps>(function AccordionDetails(
  { variant = 'plain', color = 'neutral', className, children, ...props },
  ref,
) {
  return (
    <BaseAccordion.Panel
      ref={ref}
      className={cx(
        'h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0',
        STATIC_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      <div className="px-3 pt-1 pb-6">{children}</div>
    </BaseAccordion.Panel>
  );
});
