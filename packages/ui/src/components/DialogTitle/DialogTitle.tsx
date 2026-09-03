'use client';
import * as React from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cx } from '../../utils/cx';
import { typographyVariants } from '../Typography/typographyVariants';
import type { TypographyLevel } from '../Typography/types';

export interface DialogTitleProps extends React.ComponentPropsWithoutRef<'h2'> {
  level?: TypographyLevel;
}

const SIZE_TO_LEVEL: Record<'sm' | 'md' | 'lg', TypographyLevel> = {
  sm: 'title-md',
  md: 'title-lg',
  lg: 'h4',
};

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(function DialogTitle(
  { level = SIZE_TO_LEVEL.md, className, ...props },
  ref,
) {
  return <BaseDialog.Title ref={ref} className={cx(typographyVariants({ level }), className)} {...props} />;
});
