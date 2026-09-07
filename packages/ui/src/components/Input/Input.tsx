'use client';
import * as React from 'react';
import { Input as BaseInput } from '@base-ui/react/input';
import { cx } from '../../utils/cx';
import { inputVariants } from './inputVariants';
import type { InputProps } from './types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { variant = 'outlined', color = 'neutral', size = 'md', startDecorator, endDecorator, className, ...props },
  ref,
) {
  return (
    <span className={cx(inputVariants({ variant, color, size }), className)}>
      {startDecorator && (
        <span className="inline-flex items-center text-ink-icon">{startDecorator}</span>
      )}
      {/* onChange rides along in `props`: Base UI's Input forwards unknown
          props to the real <input>, so callers get the genuine ChangeEvent
          rather than the hand-built stand-in that used to live here. That
          stand-in carried only target.value, which left react-hook-form's
          register() with no target.name to resolve the field by — it recorded
          nothing at all, silently. Verified against @base-ui/react's Input
          before removing it. */}
      <BaseInput
        ref={ref}
        className="w-full min-w-0 border-none bg-transparent p-0 outline-none"
        {...props}
      />
      {endDecorator && (
        <span className="inline-flex items-center text-ink-icon">{endDecorator}</span>
      )}
    </span>
  );
});
