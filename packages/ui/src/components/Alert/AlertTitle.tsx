import * as React from 'react';
import { cx } from '../../utils/cx';

export type AlertTitleProps = React.ComponentPropsWithoutRef<'div'>;

// 16px / 24px semibold, inheriting the alert's colour. Body text placed below
// it keeps the alert's own size (14px in `md`); give it `font-normal` for a
// regular weight, since the alert root is medium.
export const AlertTitle = React.forwardRef<HTMLDivElement, AlertTitleProps>(function AlertTitle(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx('text-base/6 font-semibold', className)} {...props} />;
});
