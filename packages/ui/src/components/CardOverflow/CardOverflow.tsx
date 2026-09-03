'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type CardOverflowProps = React.ComponentPropsWithoutRef<'div'>;

// Breaks out of the parent Card's own padding (p-4/16px) so content like a
// cover image can bleed to the card's edges. Simplified from Joy UI's
// CSS-variable-driven negative-margin calculation (which reads the actual
// Card's padding at runtime) to a fixed -16px matching our Card's own p-4.
export const CardOverflow = React.forwardRef<HTMLDivElement, CardOverflowProps>(function CardOverflow(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx('relative -mx-4 flex flex-col first:-mt-4 last:-mb-4', className)} {...props} />;
});
