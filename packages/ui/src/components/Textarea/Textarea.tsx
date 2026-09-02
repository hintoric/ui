'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { inputVariants } from '../Input/inputVariants';
import type { TextareaProps } from './types';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { variant = 'outlined', color = 'neutral', size = 'md', className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx(inputVariants({ variant, color, size }), 'items-start py-1.5', className)}
      {...props}
    />
  );
});
