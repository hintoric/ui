import type * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export interface TooltipProps {
  children: React.ReactElement;
  title: React.ReactNode;
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableInteractive?: boolean;
  /** Renders the tooltip open immediately, bypassing hover/focus. Mainly useful for tests. */
  defaultOpen?: boolean;
}
