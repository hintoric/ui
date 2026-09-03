'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { ACTIVE_BG_CLASS } from '../../utils/colorVariantClasses';
import type { ToggleButtonGroupProps } from './types';

interface ToggleChildProps {
  value?: unknown;
  className?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
}

// Scope note: Joy UI's ToggleButtonGroup supports both a single-value
// "exclusive" mode and a multi-value array mode via the same `value` prop;
// this v1 only implements the multi-select array mode (a reasonable, simpler
// subset — render a RadioGroup-backed single-select UI instead for the
// exclusive case). Selection styling reuses the same persistent "Active"
// background ListItemButton's `selected` state uses, not a color/variant
// switch — matching Joy UI's own mechanism for both.
export const ToggleButtonGroup = React.forwardRef<HTMLDivElement, ToggleButtonGroupProps>(function ToggleButtonGroup(
  {
    variant = 'outlined',
    color = 'neutral',
    orientation = 'horizontal',
    spacing = 0,
    disabled,
    value,
    defaultValue = [],
    onChange,
    className,
    children,
    ...props
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<unknown[]>(defaultValue);
  const selectedValues = value ?? uncontrolledValue;
  const connected = spacing === 0 || spacing === '0px';

  return (
    <div
      ref={ref}
      className={cx(
        'flex rounded-sm',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        connected &&
          (orientation === 'vertical'
            ? 'divide-y divide-neutral-outlined-border overflow-hidden'
            : 'divide-x divide-neutral-outlined-border overflow-hidden'),
        className,
      )}
      style={{ gap: connected ? undefined : spacing }}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<ToggleChildProps>(child)) {
          return child;
        }
        const childValue = child.props.value;
        const isSelected = selectedValues.includes(childValue);
        return React.cloneElement(child, {
          disabled: disabled || child.props.disabled,
          className: cx(child.props.className, isSelected && cx(ACTIVE_BG_CLASS[variant][color], 'font-medium')),
          onClick: (event: React.MouseEvent) => {
            child.props.onClick?.(event);
            const next = isSelected
              ? selectedValues.filter((v) => v !== childValue)
              : [...selectedValues, childValue];
            setUncontrolledValue(next);
            onChange?.(event, next);
          },
        });
      })}
    </div>
  );
});
