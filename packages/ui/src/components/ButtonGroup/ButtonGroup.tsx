'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { ButtonGroupContext } from './ButtonGroupContext';
import { buttonGroupClasses, groupGap, isConnected } from './buttonGroupClasses';
import type { ButtonGroupProps } from './types';

// Follows Joy's own mechanism (ButtonGroup.js, @mui/joy 5.0.0-beta.52): the
// group hands variant/color/size/disabled down through ButtonGroupContext, so
// bare Buttons inside it render outlined/neutral, and the connected look comes
// from per-child separator borders and corner radii (see buttonGroupClasses.ts).
// An earlier version only did layout — callers had to style each Button — and
// approximated the connected look with `overflow-hidden` + `divide-x`.
//
// Not ported: Joy's `buttonFlex` prop and its special-casing of Divider
// children.
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    orientation = 'horizontal',
    spacing = 0,
    disabled = false,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const connected = isConnected(spacing);
  const buttonGroupContext = React.useMemo(
    () => ({ variant, color, size, disabled }),
    [variant, color, size, disabled],
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
      <ButtonGroupContext.Provider value={buttonGroupContext}>
        {React.Children.map(children, (child, index) => {
          // Unlike ToggleButtonGroup, Joy's ButtonGroup leaves an only child
          // untagged.
          if (!React.isValidElement(child) || count < 2) {
            return child;
          }
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            ...(index === 0 && { 'data-first-child': '' }),
            ...(index === count - 1 && { 'data-last-child': '' }),
          });
        })}
      </ButtonGroupContext.Provider>
    </div>
  );
});
