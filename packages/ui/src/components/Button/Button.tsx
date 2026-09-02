'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { buttonVariants } from './buttonVariants';
import type { ButtonProps } from './types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    color = 'primary',
    size = 'md',
    loading = false,
    disabled,
    startDecorator,
    endDecorator,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      disabled={disabled || loading}
      className={cx(
        buttonVariants({ variant, color, size }),
        loading && 'relative text-transparent',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center text-current"
        >
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      )}
      {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
      {children}
      {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
    </BaseButton>
  );
});
