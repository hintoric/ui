'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { useButtonGroupItem } from '../ButtonGroup/useButtonGroupItem';
import { buttonVariants } from './buttonVariants';
import { ButtonBody, buttonLoadingClasses } from './ButtonBody';
import type { ButtonProps } from './types';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant: variantProp,
    color: colorProp,
    size: sizeProp,
    pill = false,
    loading = false,
    disabled: disabledProp,
    value,
    onClick: onClickProp,
    'aria-pressed': ariaPressedProp,
    startDecorator,
    endDecorator,
    className,
    children,
    ...props
  },
  ref,
) {
  const { variant, color, size, disabled, onClick, ...groupProps } = useButtonGroupItem(
    {
      variant: variantProp,
      color: colorProp,
      size: sizeProp,
      disabled: disabledProp,
      value,
      onClick: onClickProp,
      'aria-pressed': ariaPressedProp,
    },
    { variant: 'solid', color: 'primary', size: 'md' },
  );
  return (
    <BaseButton
      ref={ref}
      disabled={disabled || loading}
      value={value}
      onClick={onClick}
      aria-pressed={groupProps['aria-pressed']}
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
