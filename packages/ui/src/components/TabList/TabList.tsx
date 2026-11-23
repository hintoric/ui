'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { INDICATOR_COLOR_CLASSES, TabIndicatorContext, useSelectedTabLook } from '../Tab/TabIndicatorContext';
import { outlineWidth } from '../../styles/palette';
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
  const indicatorRef = React.useRef<HTMLSpanElement>(null);

  // Joy offsets its `::after` by `min(-1 * --variant-borderWidth, -1px)` from
  // the tab's padding box, so it spans the tab's border exactly — as long as
  // the border is drawn at its specified width (1px, or the 1.5px outline when
  // outlined). A browser that draws the outline thinner (Chromium floors it to
  // 1px at a 1x pixel ratio) leaves Joy's indicator hanging over the tab by
  // the difference. Measure what was drawn and hang over by the same amount.
  //
  // Set on the element directly and without its slide transition: it is a
  // geometry correction, not a move, and animating it would start a second
  // transition after Base UI has already positioned the indicator.
  React.useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const tab = indicator?.parentElement?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!indicator || !tab) return;
    const drawn = parseFloat(getComputedStyle(tab).borderTopWidth);
    const specified = look.variant === 'outlined' ? parseFloat(outlineWidth) : 1;
    const transition = indicator.style.transition;
    indicator.style.transition = 'none';
    indicator.style.setProperty('--indicator-overhang', `${Math.min(drawn - specified, 0)}px`);
    void indicator.offsetWidth; // commit the new geometry before restoring the transition
    indicator.style.transition = transition;
  }, [look]);

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
        ref={indicatorRef}
        className={cx(
          'pointer-events-none absolute bottom-0 z-[1] left-[calc(var(--active-tab-left)+var(--indicator-overhang,0px))] h-0.5 w-[calc(var(--active-tab-width)-2*var(--indicator-overhang,0px))] bg-current data-[orientation=vertical]:top-[calc(var(--active-tab-top)+var(--indicator-overhang,0px))] data-[orientation=vertical]:right-0 data-[orientation=vertical]:bottom-auto data-[orientation=vertical]:left-auto data-[orientation=vertical]:h-[calc(var(--active-tab-height)-2*var(--indicator-overhang,0px))] data-[orientation=vertical]:w-0.5',
          INDICATOR_COLOR_CLASSES[look.variant][look.color],
          !reducedMotion && 'transition-all duration-200',
        )}
      />
    </BaseTabs.List>
  );
});
