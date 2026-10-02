'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { useButtonGroupItem } from '../ButtonGroup/useButtonGroupItem';
import { iconButtonVariants } from './iconButtonVariants';
import type { IconButtonProps } from './types';

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant: variantProp,
    color: colorProp,
    size: sizeProp,
    pill = false,
    disabled: disabledProp,
    value,
    onClick: onClickProp,
    'aria-pressed': ariaPressedProp,
    className,
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
    { variant: 'plain', color: 'neutral', size: 'md' },
  );
  return (
    <BaseButton
      ref={ref}
      disabled={disabled}
      value={value}
      onClick={onClick}
      aria-pressed={groupProps['aria-pressed']}
      // After the variants, so twMerge drops their `rounded-sm`.
      className={cx(iconButtonVariants({ variant, color, size }), pill && 'rounded-full', className)}
      {...props}
    />
  );
});
