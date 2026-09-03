'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { GridProps } from './types';

// Scope note: Joy UI's Grid (from @mui/system's Unstable_Grid) is actually
// flexbox-based internally, with percentage flex-basis per breakpoint and
// negative-margin gutters — replicating that exactly would mean matching a
// large, mostly-undocumented internal calc system. This v1 uses modern CSS
// Grid instead (a 12-column track + `grid-column: span N`), and only
// supports a single non-responsive `xs` column span — no sm/md/lg/xl
// breakpoint overrides. Visually equivalent for the common case, not a
// byte-for-byte match, so it's tested by achieved layout width rather than
// raw CSS text (same approach as AspectRatio's aspect-ratio vs padding-hack
// difference).
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(function Grid(
  { container = false, spacing = 0, xs, className, style, ...props },
  ref,
) {
  if (container) {
    return (
      <div
        ref={ref}
        className={cx('grid grid-cols-12', className)}
        style={{ gap: spacing, ...style }}
        {...props}
      />
    );
  }

  const gridColumn = xs === true ? '1 / -1' : typeof xs === 'number' ? `span ${xs} / span ${xs}` : undefined;

  return <div ref={ref} className={className} style={{ gridColumn, ...style }} {...props} />;
});
