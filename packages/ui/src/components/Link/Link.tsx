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
// directly from `theme.vars.palette[color].mainChannel`, which is the same
// numeric channel our own `-500` color step is built from. Confirmed against
// @mui/joy's Link.js source.
const PLAIN_COLOR_CLASS = {
  primary: 'text-primary-500',
  neutral: 'text-neutral-500',
  danger: 'text-danger-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
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
