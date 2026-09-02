'use client';
import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { cx } from '../../utils/cx';
import { inputVariants } from './inputVariants';
import type { InputProps } from './types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    startDecorator,
    endDecorator,
    className,
    onChange,
    ...props
  },
  ref,
) {
  return (
    <span className={cx(inputVariants({ variant, color, size }), className)}>
      {startDecorator && (
        <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>
      )}
      <BaseInput
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 outline-none"
        // Base UI reports changes via onValueChange(value), not a native onChange
        // event. Build a minimal ChangeEvent-shaped object (target.value /
        // currentTarget.value only) so callers can keep Joy UI's onChange(event)
        // signature. This is not a full native ChangeEvent.
        onValueChange={
          onChange
            ? (value: string) => {
                const fakeEvent = {
                  target: { value },
                  currentTarget: { value },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(fakeEvent);
              }
            : undefined
        }
        {...props}
      />
      {endDecorator && (
        <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>
      )}
    </span>
  );
});
