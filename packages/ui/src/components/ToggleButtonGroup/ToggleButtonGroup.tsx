'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { ButtonGroupContext } from '../ButtonGroup/ButtonGroupContext';
import { buttonGroupClasses, groupGap, isConnected } from '../ButtonGroup/buttonGroupClasses';
import { ToggleButtonGroupContext } from './ToggleButtonGroupContext';
import type { ToggleButtonGroupProps } from './types';

// Scope note: Joy UI's ToggleButtonGroup supports both a single-value
// "exclusive" mode and a multi-value array mode via the same `value` prop;
// this v1 only implements the multi-select array mode.
//
// Everything else follows Joy's own mechanism (ToggleButtonGroup.js +
// ButtonGroup.js, @mui/joy 5.0.0-beta.52): the group hands variant/color/size/
// disabled down through ButtonGroupContext, so bare Buttons inside it render
// outlined/neutral; selection reaches each button as `aria-pressed`, which
// Button and IconButton style with their variant's Active tokens; and the
// connected look comes from per-child separator borders and corner radii (see
// buttonGroupClasses.ts). An earlier version cloned an Active background onto
// the selected child and approximated the rest with `overflow-hidden` +
// `divide-x`, leaving the buttons at solid/primary — a visual test that only
// compared the group root never noticed.
export const ToggleButtonGroup = React.forwardRef<HTMLDivElement, ToggleButtonGroupProps>(function ToggleButtonGroup(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    orientation = 'horizontal',
    spacing = 0,
    disabled = false,
    value,
    defaultValue = [],
    onChange,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<unknown[]>(defaultValue);
  const selectedValues = value ?? uncontrolledValue;
  const connected = isConnected(spacing);

  const buttonGroupContext = React.useMemo(
    () => ({ variant, color, size, disabled }),
    [variant, color, size, disabled],
  );
  const toggleContext = React.useMemo(
    () => ({
      value: selectedValues,
      onClick: (event: React.MouseEvent<HTMLButtonElement>, childValue: unknown) => {
        if (childValue === undefined) return;
        const next = selectedValues.includes(childValue)
          ? selectedValues.filter((v) => v !== childValue)
          : [...selectedValues, childValue];
        setUncontrolledValue(next);
        onChange?.(event, next);
      },
    }),
    [selectedValues, onChange],
  );

  const count = React.Children.count(children);
  return (
    <div
      ref={ref}
      role="group"
      className={cx(buttonGroupClasses({ variant, color, orientation, connected }), className)}
      style={{ gap: groupGap(spacing), ...style }}
      {...props}
    >
      <ToggleButtonGroupContext.Provider value={toggleContext}>
        <ButtonGroupContext.Provider value={buttonGroupContext}>
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) {
              return child;
            }
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              ...(index === 0 && { 'data-first-child': '' }),
              ...(index === count - 1 && { 'data-last-child': '' }),
            });
          })}
        </ButtonGroupContext.Provider>
      </ToggleButtonGroupContext.Provider>
    </div>
  );
});
