'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { avatarVariants } from './avatarVariants';
import type { AvatarProps } from './types';

export const Avatar = React.forwardRef<HTMLElement, AvatarProps>(function Avatar(
  { component, variant, color, size = 'md', src, srcSet, alt, className, children, ...props },
  ref,
) {
  return useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      { className: cx(avatarVariants({ variant, color, size }), className) },
      props,
      { children: src || srcSet ? <img className="size-full object-cover" src={src} srcSet={srcSet} alt={alt} /> : children },
    ),
  });
});
