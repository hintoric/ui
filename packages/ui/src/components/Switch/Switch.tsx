'use client';
import * as React from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { cx } from '../../utils/cx';
import { SWITCH_SOLID_VARS, SWITCH_SIZE } from './switchColors';
import type { SwitchProps } from './types';

// Switch's variant is always "solid" — only `color` toggles between neutral
// (unchecked) and primary (checked), unless the caller passes an explicit
// color, matching Joy UI's own `color: checked ? color || 'primary' : color
// || 'neutral'`. Confirmed against @mui/joy's Switch.js source.
export const Switch = React.forwardRef<HTMLElement, SwitchProps>(function Switch(
  {
    color,
    size = 'md',
    checked,
    defaultChecked,
    disabled,
    readOnly,
    required,
    startDecorator,
    endDecorator,
    className,
    onCheckedChange,
    ...props
  },
  ref,
) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false);
  const isChecked = checked ?? uncontrolledChecked;
  const effectiveColor = color ?? (isChecked ? 'primary' : 'neutral');
  const { track, thumb } = SWITCH_SOLID_VARS[effectiveColor];
  const { trackWidth, trackHeight, thumbSize } = SWITCH_SIZE[size];
  const padding = (trackHeight - thumbSize) / 2;

  return (
    <span className="inline-flex items-center gap-2">
      {startDecorator}
      <BaseSwitch.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onCheckedChange={(next) => {
          setUncontrolledChecked(next);
          onCheckedChange?.(next);
        }}
        className={cx(
          // Literal 16px (theme.vars.radius.xl) rather than Tailwind's
          // `rounded-full` (a huge computed px number) — same lesson as
          // Avatar/Chip/Badge/ChipDelete/Skeleton. Confirmed against
          // @mui/joy's Switch.js source.
          'relative inline-flex shrink-0 items-center rounded-[16px] transition-colors cursor-pointer data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
          className,
        )}
        style={{ width: trackWidth, height: trackHeight, backgroundColor: track, padding }}
        {...props}
      >
        <BaseSwitch.Thumb
          className="rounded-[50%] shadow-sm transition-transform"
          style={{
            width: thumbSize,
            height: thumbSize,
            backgroundColor: thumb,
            transform: isChecked ? `translateX(${trackWidth - trackHeight}px)` : 'translateX(0)',
          }}
        />
      </BaseSwitch.Root>
      {endDecorator}
    </span>
  );
});
