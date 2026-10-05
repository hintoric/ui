'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { INDICATOR_COLOR_CLASSES, TabIndicatorContext, useSelectedTabLook } from '../Tab/TabIndicatorContext';
import type { TabListProps } from './types';

// Confirmed against @mui/joy's TabList.js source: variant/color default
// independently to plain/neutral (NOT inherited from the enclosing <Tabs>).
//
// The rest is TabList.js too, measured in TabList.visual.test.tsx:
// - `--List-gap: 0px` — tabs touch; there is no gap.
// - The default underline (`disableUnderline` false): a 1px inset divider on
//   the `underlinePlacement` side — bottom when horizontal, right when
//   vertical — with a 1px padding on that side for the indicator to sit on.
// - `z-index: 1`, so the strip stays above the panels.
//
// Joy draws the selected tab's indicator as a static `::after` on that tab,
// coloured `currentColor` — the *tab's* ink, not the strip's. This uses Base
// UI's Tabs.Indicator instead, one element that slides between tabs, and
// takes the colour the selected Tab reports through TabIndicatorContext.
// Like Joy's, it sits on the underline side: under the tab, or to its right.
export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { variant = 'plain', color = 'neutral', className, children, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const [look, reportLook] = useSelectedTabLook();

  return (
    <BaseTabs.List
      ref={ref}
      className={cx(
        'relative z-[1] flex pb-px shadow-[inset_0_-1px_var(--color-divider)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:pb-0 data-[orientation=vertical]:pr-px data-[orientation=vertical]:shadow-[inset_-1px_0_var(--color-divider)]',
        STATIC_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      <TabIndicatorContext.Provider value={reportLook}>{children}</TabIndicatorContext.Provider>
      <BaseTabs.Indicator
        className={cx(
          'pointer-events-none absolute bottom-0 z-[1] left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] bg-current data-[orientation=vertical]:top-[var(--active-tab-top)] data-[orientation=vertical]:right-0 data-[orientation=vertical]:bottom-auto data-[orientation=vertical]:left-auto data-[orientation=vertical]:h-[var(--active-tab-height)] data-[orientation=vertical]:w-0.5',
          INDICATOR_COLOR_CLASSES[look.variant][look.color],
          !reducedMotion && 'transition-all duration-200',
        )}
      />
    </BaseTabs.List>
  );
});
