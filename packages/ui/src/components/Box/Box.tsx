'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import type { BoxProps } from './types';

export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box(
  { component, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>({ className: cx(className) }, props),
  });
});
