'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { useReducedMotion } from '../../theme/ReducedMotionProvider';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { TabListProps } from './types';

// Confirmed against @mui/joy's TabList.js source: variant/color default
// independently to plain/neutral (NOT inherited from the enclosing <Tabs>).
//
// Scope note: Joy draws the active-tab underline as a static `::after`
// pseudo-element on whichever Tab has `aria-selected`, sized to that tab
// alone (no animation). This uses Base UI's Tabs.Indicator instead — a
// single shared element Base UI slides/resizes via CSS custom properties
// (`--active-tab-left`/`-width`) — which reproduces the same visual result
// (an underline beneath the active tab) plus a smooth transition Joy's
// version doesn't have.
export const TabList = React.forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { variant = 'plain', color = 'neutral', className, children, ...props },
  ref,
) {
  const reducedMotion = useReducedMotion();

  return (
    <BaseTabs.List
      ref={ref}
      className={cx(
        'relative flex gap-1 data-[orientation=vertical]:flex-col',
        STATIC_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      {children}
      <BaseTabs.Indicator
        className={cx(
          'absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] bg-current data-[orientation=vertical]:top-[var(--active-tab-top)] data-[orientation=vertical]:left-0 data-[orientation=vertical]:h-[var(--active-tab-height)] data-[orientation=vertical]:w-0.5',
          !reducedMotion && 'transition-all duration-200',
        )}
      />
    </BaseTabs.List>
  );
});
