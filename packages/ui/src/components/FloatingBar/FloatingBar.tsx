'use client';
import * as React from 'react';
import { useRender } from '@base-ui/react/use-render';
import { mergeProps } from '@base-ui/react/merge-props';
import { cx } from '../../utils/cx';
import { asRenderProp } from '../../utils/asRenderProp';
import { sheetVariants } from '../Sheet/sheetVariants';
import { FloatingBarContext } from './FloatingBarContext';
import type { FloatingBarAlign, FloatingBarPlacement, FloatingBarProps } from './types';

/**
 * Every distance is a custom property with a fallback, never a plain value.
 *
 * The reason is the narrow screen: a bar that straddles the right edge of a
 * dialog has to move inside once there is no room beside it, and that is a
 * media query in the consumer's stylesheet. A prop cannot answer a media
 * query, and an inline value cannot be overridden by one — a custom property
 * read with `var(…, fallback)` can, from any rule that sets it, with no
 * specificity contest at all.
 */
function floatingStyle(
  placement: FloatingBarPlacement,
  align: FloatingBarAlign,
  straddle: boolean,
): React.CSSProperties {
  const upright = placement === 'left' || placement === 'right';
  // Straddling puts the bar's edge on the container's edge and the transform
  // pushes half of it out; inside, it keeps its distance.
  const inset = `var(--floating-bar-inset, ${straddle ? '0px' : '1rem'})`;
  const offset = 'var(--floating-bar-offset, 1rem)';
  const over = `var(--floating-bar-straddle, ${straddle ? '50%' : '0%'})`;

  const style: Record<string, string> = { [placement]: inset };
  if (align === 'center') {
    style[upright ? 'top' : 'left'] = '50%';
  } else if (upright) {
    style[align === 'start' ? 'top' : 'bottom'] = offset;
  } else {
    style[align === 'start' ? 'left' : 'right'] = offset;
  }

  // The magnitude stays unsigned so that a consumer overriding it does not
  // have to know which way "out" points on this edge.
  const out =
    placement === 'right'
      ? `translateX(${over})`
      : placement === 'left'
        ? `translateX(calc(-1 * ${over}))`
        : placement === 'bottom'
          ? `translateY(${over})`
          : `translateY(calc(-1 * ${over}))`;
  const centring = align === 'center' ? (upright ? ' translateY(-50%)' : ' translateX(-50%)') : '';
  style.transform = out + centring;

  return style as React.CSSProperties;
}

/**
 * A pill of actions that floats over what it acts on.
 *
 * There is no Joy counterpart. It exists because the shape changes what the
 * parts inside it may look like: in a round bar a selected button has to be a
 * circle, and an `IconButton`'s `rounded-sm` corner in a `rounded-full`
 * container reads as a mistake. `FloatingBarButton` is that circle.
 */
export const FloatingBar = React.forwardRef<HTMLElement, FloatingBarProps>(function FloatingBar(
  {
    component,
    variant = 'outlined',
    color = 'neutral',
    size = 'md',
    orientation,
    placement,
    align = 'center',
    straddle = false,
    className,
    style,
    ...props
  },
  ref,
) {
  const upright = orientation ? orientation === 'vertical' : placement === 'left' || placement === 'right';
  const context = React.useMemo(() => ({ size }), [size]);

  const element = useRender({
    defaultTagName: 'div',
    render: asRenderProp(component),
    ref,
    props: mergeProps<'div'>(
      {
        role: 'toolbar',
        // A toolbar is horizontal unless it says otherwise.
        'aria-orientation': upright ? ('vertical' as const) : undefined,
        className: cx(
          'inline-flex items-center gap-1 rounded-full p-1 shadow-md',
          upright ? 'flex-col' : 'flex-row',
          placement && 'absolute z-10',
          sheetVariants({ variant, color }),
          className,
        ),
        style: { ...(placement ? floatingStyle(placement, align, straddle) : null), ...style },
      },
      props,
    ),
  });

  return <FloatingBarContext.Provider value={context}>{element}</FloatingBarContext.Provider>;
});
