'use client';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cx } from '../../utils/cx';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { TooltipProps } from './types';

const SIZE_CLASS = {
  sm: 'py-0.5 px-1.5 text-xs',
  md: 'py-1 px-2 text-sm',
  lg: 'py-1.5 px-2.5 text-base',
} as const;

export function Tooltip({
  children,
  title,
  variant = 'solid',
  color = 'neutral',
  size = 'md',
  placement = 'bottom',
  defaultOpen,
}: TooltipProps) {
  return (
    <BaseTooltip.Root disabled={!title} defaultOpen={defaultOpen}>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={placement} sideOffset={8}>
          <BaseTooltip.Popup
            className={cx(
              'z-50 rounded-sm font-body shadow-[var(--shadow-xs)]',
              SIZE_CLASS[size],
              SURFACE_COLOR_CLASSES[variant][color],
            )}
          >
            {title}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
