'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { TabsSizeContext } from './TabsContext';
import type { TabsProps } from './types';

// Confirmed against @mui/joy's Tabs.js source: `size` is the only prop
// threaded down to TabList/Tab/TabPanel via context — variant/color are NOT
// inherited by them (see TabsContext.ts).
//
// Joy's TabsRoot sets `position: relative` and `theme.typography[body-${size}]`
// (font-size by size, line-height always `lineHeight-md`) and no border-radius
// at all — the root is square in every variant.
const SIZE_CLASSES = {
  sm: 'text-sm leading-normal',
  md: 'text-base leading-normal',
  lg: 'text-lg leading-normal',
} as const;

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    variant = 'plain',
    color = 'neutral',
    size = 'md',
    orientation = 'horizontal',
    value,
    defaultValue,
    onChange,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <BaseTabs.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next, eventDetails) =>
        onChange?.(eventDetails.event as unknown as React.SyntheticEvent | undefined, next as string | number | null)
      }
      orientation={orientation}
      className={cx(
        'relative flex',
        orientation === 'vertical' ? 'flex-row' : 'flex-col',
        'font-body',
        SIZE_CLASSES[size],
        SURFACE_COLOR_CLASSES[variant][color],
        className,
      )}
      {...props}
    >
      <TabsSizeContext.Provider value={size}>{children}</TabsSizeContext.Provider>
    </BaseTabs.Root>
  );
});
