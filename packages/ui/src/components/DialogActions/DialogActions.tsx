'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type DialogActionsProps = React.ComponentPropsWithoutRef<'div'>;

// Joy UI's DialogActions literally extends CardActions's own styling
// (`styled(StyledCardActionsRoot, ...)`) with orientation defaulted to
// "horizontal-reverse" — a reversed flex row (not `justify-content:
// flex-end`, which stays at its browser default of `normal`). Confirmed
// against @mui/joy's DialogActions.js source.
export const DialogActions = React.forwardRef<HTMLDivElement, DialogActionsProps>(function DialogActions(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cx('flex flex-row-reverse items-center gap-2', className)} {...props} />;
});
