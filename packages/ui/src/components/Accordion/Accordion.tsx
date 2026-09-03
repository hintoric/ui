'use client';
import * as React from 'react';
import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { AccordionProps } from './types';

const ITEM_VALUE = 'panel';

// Each Joy UI <Accordion> manages its OWN independent expanded/collapsed
// state (a plain boolean prop), unlike Base UI's Accordion.Root, which
// coordinates a shared array of open item values across ALL its Item
// children. AccordionGroup is confirmed (against @mui/joy's source) to be a
// pure styling wrapper with no shared open/close state of its own — so each
// Accordion wraps its OWN private Root+Item pair to faithfully reproduce
// that per-item independence, bridging the boolean prop to a one-item array.
//
// The item's own variant/color (Avatar-style direct application, no surface
// fallback — confirmed against @mui/joy's ListItem.js, which Accordion's
// root extends) is NOT inherited by AccordionSummary or AccordionDetails:
// both of those default their OWN variant/color independently to
// plain/neutral regardless of what's passed here, so they render
// unstyled/transparent unless a caller explicitly re-specifies variant/color
// on each of them directly. Confirmed against @mui/joy's real computed
// styles, not just the source formula (a real background WAS visible behind
// a transparent AccordionSummary in a solid/danger screenshot at first,
// which briefly looked like AccordionSummary itself was colored).
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { variant = 'plain', color = 'neutral', expanded, defaultExpanded = false, onChange, disabled, className, children, ...props },
  ref,
) {
  const isControlled = expanded !== undefined;

  return (
    <BaseAccordion.Root
      value={isControlled ? (expanded ? [ITEM_VALUE] : []) : undefined}
      defaultValue={defaultExpanded ? [ITEM_VALUE] : []}
      onValueChange={(value) => onChange?.(undefined, (value as string[]).includes(ITEM_VALUE))}
      disabled={disabled}
    >
      <BaseAccordion.Item
        ref={ref}
        value={ITEM_VALUE}
        className={cx('block', STATIC_COLOR_CLASSES[variant][color], className)}
        {...props}
      >
        {children}
      </BaseAccordion.Item>
    </BaseAccordion.Root>
  );
});
