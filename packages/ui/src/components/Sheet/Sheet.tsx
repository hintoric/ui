'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { sheetVariants } from './sheetVariants';
import type { SheetProps } from './types';

export const Sheet = React.forwardRef<HTMLElement, SheetProps>(function Sheet(
  { component, variant, color, className, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>({ className: cx(sheetVariants({ variant, color }), className) }, props),
  });
});
