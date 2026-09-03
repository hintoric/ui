'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { alertVariants } from './alertVariants';
import type { AlertProps } from './types';

export const Alert = React.forwardRef<HTMLElement, AlertProps>(function Alert(
  { component, variant, color, size = 'md', role = 'alert', startDecorator, endDecorator, className, children, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      { className: cx(alertVariants({ variant, color, size }), className), role },
      props,
      {
        children: (
          <>
            {startDecorator && <span className="inline-flex items-center">{startDecorator}</span>}
            <span className="min-w-0 flex-1">{children}</span>
            {endDecorator && <span className="inline-flex items-center">{endDecorator}</span>}
          </>
        ),
      },
    ),
  });
});
