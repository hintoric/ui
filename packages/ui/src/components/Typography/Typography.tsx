'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { typographyVariants, TYPOGRAPHY_DEFAULT_TAG } from './typographyVariants';
import type { TypographyProps } from './types';

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(function Typography(
  { component, level = 'body-md', className, ...props },
  ref,
) {
  const tag = component ?? TYPOGRAPHY_DEFAULT_TAG[level];
  return useRender({
    defaultTagName: 'p',
    render: asRenderProp(tag),
    ref,
    props: mergeProps<'p'>({ className: cx(typographyVariants({ level }), className) }, props),
  });
});
