'use client';
import * as React from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { TabsSizeContext } from '../Tabs/TabsContext';
import type { TabPanelProps } from './types';

// Confirmed against @mui/joy's TabPanel.js source: variant/color default
// independently to plain/neutral (not inherited from <Tabs>), padding and
// font-size both come from the inherited `size` (--Tabs-spacing: 12/16/20px,
// and `body-${size}` directly — sm->14px/md->16px/lg->18px, NOT the
// shifted-down mapping some other components use).
const SIZE_CLASS = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-5 text-lg',
} as const;

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { variant = 'plain', color = 'neutral', value, className, children, ...props },
  ref,
) {
  const size = React.useContext(TabsSizeContext);
  return (
    <BaseTabs.Panel
      ref={ref}
      value={value}
      className={cx('font-body', SIZE_CLASS[size], STATIC_COLOR_CLASSES[variant][color], className)}
      {...props}
    >
      {children}
    </BaseTabs.Panel>
  );
});
