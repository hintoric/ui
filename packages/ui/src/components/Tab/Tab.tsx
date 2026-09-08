'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import { TabsSizeContext } from '../Tabs/TabsContext';
import type { TabProps } from './types';

const SIZE_CLASS = {
  sm: 'min-h-8 px-2 text-sm',
  md: 'min-h-9 px-3 text-base',
  lg: 'min-h-11 px-4 text-lg',
} as const;

// Extends ListItemButton's own styling (STATIC/INTERACTIVE base, no separate
// surface fallback) — confirmed against @mui/joy's Tab.js source
// (`styled(StyledListItemButton, ...)`). Unlike ListItemButton/Option,
// A selected Tab keeps its variant's ACTIVE background, persistently.
//
// Tab.tsx used to state the opposite — "aria-selected gets NO persistent
// background change here" — on the strength of reading @mui/joy's Tab.js.
// That was wrong: Joy's Tab is `styled(StyledListItemButton)`, and the
// selected background comes from that base rather than from Tab.js. Measured
// 2026-09-07 against the real package: a selected solid/primary Tab renders
// #12467B (primary-700, i.e. `solid-active-bg`) where ours rendered #0B6BCB.
//
// Written out literally rather than composed from `variant`/`color` because
// Tailwind only generates classes it can find as literal strings in source.
const SELECTED_BG_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'aria-selected:bg-primary-solid-active-bg',
    neutral: 'aria-selected:bg-neutral-solid-active-bg',
    danger: 'aria-selected:bg-danger-solid-active-bg',
    success: 'aria-selected:bg-success-solid-active-bg',
    warning: 'aria-selected:bg-warning-solid-active-bg',
  },
  soft: {
    primary: 'aria-selected:bg-primary-soft-active-bg',
    neutral: 'aria-selected:bg-neutral-soft-active-bg',
    danger: 'aria-selected:bg-danger-soft-active-bg',
    success: 'aria-selected:bg-success-soft-active-bg',
    warning: 'aria-selected:bg-warning-soft-active-bg',
  },
  outlined: {
    primary: 'aria-selected:bg-primary-outlined-active-bg',
    neutral: 'aria-selected:bg-neutral-outlined-active-bg',
    danger: 'aria-selected:bg-danger-outlined-active-bg',
    success: 'aria-selected:bg-success-outlined-active-bg',
    warning: 'aria-selected:bg-warning-outlined-active-bg',
  },
  plain: {
    primary: 'aria-selected:bg-primary-plain-active-bg',
    neutral: 'aria-selected:bg-neutral-plain-active-bg',
    danger: 'aria-selected:bg-danger-plain-active-bg',
    success: 'aria-selected:bg-success-plain-active-bg',
    warning: 'aria-selected:bg-warning-plain-active-bg',
  },
};

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { variant = 'plain', color = 'neutral', value, disabled, className, children, ...props },
  ref,
) {
  const size = React.useContext(TabsSizeContext);
  return (
    <BaseTabs.Tab
      ref={ref}
      value={value}
      disabled={disabled}
      className={cx(
        'relative flex cursor-pointer items-center justify-center gap-2 rounded-[inherit] border-none font-body transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60',
        SIZE_CLASS[size],
        INTERACTIVE_COLOR_CLASSES[variant][color],
        SELECTED_BG_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      {children}
    </BaseTabs.Tab>
  );
});
