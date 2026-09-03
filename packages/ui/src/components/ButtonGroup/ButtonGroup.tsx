'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { ButtonGroupProps } from './types';

// Scope note: Joy UI's ButtonGroup pushes variant/color/size/disabled down to
// child Buttons via a shared context (Button.js reads ButtonGroupContext for
// its defaults) and suppresses inner border-radius on middle buttons for a
// seamless connected look. Reproducing the context wiring means touching
// Button's already-shipped/tested contract, so this v1 only handles layout —
// callers pass variant/color/size to each Button explicitly. The "connected"
// visual (spacing=0) is approximated with overflow-hidden + divide borders
// rather than Joy's per-child radius suppression.
export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation = 'horizontal', spacing = 0, disabled, className, style, ...props },
  ref,
) {
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
      style={{ gap: connected ? undefined : spacing, ...style }}
      aria-disabled={disabled}
      {...props}
    />
  );
});
