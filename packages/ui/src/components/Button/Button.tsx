'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { buttonVariants } from './buttonVariants';
import { ButtonBody, buttonLoadingClasses } from './ButtonBody';
import type { ButtonProps } from './types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    color = 'primary',
    size = 'md',
    pill = false,
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
        // After the variants, so twMerge drops their `rounded-sm`.
        pill && 'rounded-full',
        buttonLoadingClasses(loading),
        className,
      )}
      {...props}
    >
      <ButtonBody
        variant={variant}
        color={color}
        loading={loading}
        startDecorator={startDecorator}
        endDecorator={endDecorator}
      >
        {children}
      </ButtonBody>
    </BaseButton>
  );
});
