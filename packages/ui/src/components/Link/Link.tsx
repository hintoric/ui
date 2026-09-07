'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { LinkProps } from './types';

const UNDERLINE_CLASS = {
  none: 'no-underline',
  hover: 'no-underline hover:underline',
  always: 'underline',
} as const;

// Plain (no variant) Link uses the raw palette color at full opacity, not the
// "plain" variant's own color token — Joy UI's own StyledLinkRoot computes it
// directly from `theme.vars.palette[color].mainChannel` (Link.js:120).
//
// Corrected 2026-09-07: this used to read `-500` on the reasoning that `-500`
// *is* the main channel. That holds only in light mode. Joy remaps the main
// channel to step 400 in dark (extendTheme.js:393-403), so a hardcoded `-500`
// kept its light colour on a dark page — every colour, every dark render.
// `--color-*-main` carries that remap; see the note beside it in theme.css.
const PLAIN_COLOR_CLASS = {
  primary: 'text-primary-main',
  neutral: 'text-neutral-main',
  danger: 'text-danger-main',
  success: 'text-success-main',
  warning: 'text-warning-main',
} as const;

export const Link = React.forwardRef<HTMLElement, LinkProps>(function Link(
  {
    component,
    variant,
    color = 'primary',
    underline = 'hover',
    startDecorator,
    endDecorator,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return useRender({
    defaultTagName: 'a',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'a'>(
      {
        className: cx(
          'inline-flex cursor-pointer items-center rounded-[2px] font-body',
          UNDERLINE_CLASS[underline],
          variant ? cx('px-1 py-0.5', INTERACTIVE_COLOR_CLASSES[variant][color]) : PLAIN_COLOR_CLASS[color],
          disabled && 'pointer-events-none opacity-60',
          className,
        ),
      },
      props,
      {
        children: (
          <>
            {startDecorator && <span className="mr-1 inline-flex items-center">{startDecorator}</span>}
            {children}
            {endDecorator && <span className="ml-1 inline-flex items-center">{endDecorator}</span>}
          </>
        ),
      },
    ),
  });
});
