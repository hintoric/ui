'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
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
// `aria-selected` gets NO persistent background change here — only the
// indicator underline (drawn by TabList) marks the active tab.
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
        className,
      )}
      {...props}
    >
      {children}
    </BaseTabs.Tab>
  );
});
