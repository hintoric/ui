'use client';
import * as React from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cx } from '../../utils/cx';
import { iconButtonVariants } from './iconButtonVariants';
import type { IconButtonProps } from './types';

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'plain', color = 'neutral', size = 'md', className, ...props },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      className={cx(iconButtonVariants({ variant, color, size }), className)}
      {...props}
    />
  );
});
