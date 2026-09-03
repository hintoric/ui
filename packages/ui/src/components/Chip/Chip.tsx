'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { chipVariants } from './chipVariants';
import type { ChipProps } from './types';

export const Chip = React.forwardRef<HTMLElement, ChipProps>(function Chip(
  { component, variant, color, size = 'md', startDecorator, endDecorator, className, children, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      { className: cx(chipVariants({ variant, color, size }), className) },
      props,
      {
        children: (
          <>
            {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
            <span className="inline-block min-w-0 flex-1 overflow-hidden text-ellipsis">{children}</span>
            {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
          </>
        ),
      },
    ),
  });
});
