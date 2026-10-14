'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { alertVariants, DECORATOR_CLASSES } from './alertVariants';
import { AlertIcon } from './AlertIcon';
import type { AlertProps } from './types';

export const Alert = React.forwardRef<HTMLElement, AlertProps>(function Alert(
  { component, variant, color, size = 'md', role = 'alert', startDecorator, endDecorator, className, children, ...props },
  ref,
) {
  // undefined means "the default icon"; null or false leaves the slot empty.
  const start = startDecorator === undefined ? <AlertIcon color={color} size={size} /> : startDecorator;
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
            {start && <span className={DECORATOR_CLASSES}>{start}</span>}
            <span className="min-w-0 flex-1">{children}</span>
            {endDecorator && <span className={DECORATOR_CLASSES}>{endDecorator}</span>}
          </>
        ),
      },
    ),
  });
});
