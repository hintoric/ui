'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { stackVariants, type StackSpacingKey } from './stackVariants';
import type { StackProps } from './types';

export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  { component, direction, spacing = 0, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      {
        className: cx(
          stackVariants({ direction, spacing: String(spacing) as StackSpacingKey }),
          className,
        ),
      },
      props,
    ),
  });
});
