'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { AspectRatioProps } from './types';

// Joy UI achieves the ratio with a legacy padding-bottom-percentage hack
// (clamped between minHeight/maxHeight). We use the modern CSS `aspect-ratio`
// property instead — same visual result, far simpler, and not something a
// computed-style string comparison can meaningfully unify across techniques,
// so the visual test compares achieved dimensions rather than raw CSS text.
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = '16 / 9', minHeight, maxHeight, objectFit = 'cover', className, style, children, ...props },
  ref,
) {
  const cssRatio = typeof ratio === 'number' ? `${ratio}` : ratio.replace(/\s*\/\s*/, ' / ');
  return (
    <div
      ref={ref}
      className={cx('relative w-full overflow-hidden rounded-[var(--radius-md)]', className)}
      style={{
        aspectRatio: cssRatio,
        minHeight,
        maxHeight,
        ...style,
      }}
      {...props}
    >
      {React.isValidElement<{ style?: React.CSSProperties; className?: string }>(children)
        ? React.cloneElement(children, {
            className: cx('absolute inset-0 size-full', children.props.className),
            style: { objectFit, ...children.props.style },
          })
        : children}
    </div>
  );
});
