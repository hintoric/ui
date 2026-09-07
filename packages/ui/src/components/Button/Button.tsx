'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { DISABLED_TEXT_CLASSES } from '../../utils/colorVariantClasses';
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
        // `text-transparent!` rather than plain `text-transparent`: Button
        // disables itself while loading, and `disabled:text-*` from the
        // variant map outranks a bare `text-transparent` on specificity, so the
        // label would show through behind the spinner. Joy solves the same
        // clash by ordering (`color: 'transparent'` placed after its variant
        // styles — see its own Button.js comment); with classes from a shared
        // map, order is not ours to choose, so importance is.
        loading && 'relative text-transparent!',
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className={cx('absolute inset-0 flex items-center justify-center', DISABLED_TEXT_CLASSES[variant][color])}
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
