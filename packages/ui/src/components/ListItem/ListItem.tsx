'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';

export type ListItemProps = React.ComponentPropsWithoutRef<'li'>;

export const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(function ListItem(
  { className, ...props },
  ref,
) {
  return (
    <li
      ref={ref}
      // `text-ink-secondary` because ours inherited the page's black where real
      // @mui/joy renders #32383E in light and #CDD7E1 in dark — which are
      // exactly this token's two values, measured 2026-09-07. Joy reaches them
      // through its variant system on the list rather than a literal style on
      // either component, so this is the minimal faithful correction: the row
      // is the element whose readability matters, and List's own colour is
      // left alone so its existing comparison stays meaningful.
      className={cx(
        'flex min-h-9 items-center gap-2.5 rounded-[inherit] px-3 py-1 text-ink-secondary',
        className,
      )}
      {...props}
    />
  );
});
