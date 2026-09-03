'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type CardCoverProps = React.ComponentPropsWithoutRef<'div'>;

// Positions an image/video/gradient to fill and sit behind the Card's
// content — a full-bleed background layer. Confirmed against @mui/joy's
// CardCover.js source.
export const CardCover = React.forwardRef<HTMLDivElement, CardCoverProps>(function CardCover(
  { className, children, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cx('absolute inset-0 z-0 rounded-[inherit]', className)} {...props}>
      {React.isValidElement<{ className?: string }>(children)
        ? React.cloneElement(children, {
            className: cx('flex size-full items-center justify-center rounded-[inherit] object-cover', children.props.className),
          })
        : children}
    </div>
  );
});
