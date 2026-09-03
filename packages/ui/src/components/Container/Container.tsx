'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { ContainerProps } from './types';

// MUI's default breakpoint values (xs/sm/md/lg/xl) — Joy UI's own Container
// only applies each max-width once the viewport actually crosses that
// breakpoint (`@media (min-width: Npx)`), not as a flat always-on value.
// Confirmed empirically against the real @mui/joy package: at a viewport
// between the xs and sm breakpoints, Joy's own computed max-width is `none`
// for maxWidth="sm" and up. Tailwind's arbitrary `min-[Npx]:` variant
// reproduces the same real media query, unlike a plain inline style.
// "xs" is a special case: its breakpoint THRESHOLD is 0 (always active,
// regardless of viewport) but the max-width VALUE it applies is 444px — the
// two are decoupled, unlike sm/md/lg/xl where the threshold and the value
// are the same number. Confirmed empirically against the real @mui/joy
// package at a 414px test viewport (below every other threshold, yet xs's
// 444px still applied).
const MAX_WIDTH_CLASS: Record<Exclude<ContainerProps['maxWidth'], false | undefined>, string> = {
  xs: 'max-w-[444px]',
  sm: '[@media(min-width:600px)]:max-w-[600px]',
  md: '[@media(min-width:900px)]:max-w-[900px]',
  lg: '[@media(min-width:1200px)]:max-w-[1200px]',
  xl: '[@media(min-width:1536px)]:max-w-[1536px]',
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(function Container(
  { component: Component = 'div', maxWidth = 'lg', disableGutters = false, fixed, className, ...props },
  ref,
) {
  // `fixed` isn't implemented in this v1 (see MAX_WIDTH_CLASS's doc comment);
  // destructured only so it doesn't leak onto the DOM element via `...props`.
  void fixed;
  return (
    <Component
      ref={ref}
      className={cx(
        'mx-auto box-border w-full',
        !disableGutters && 'px-4 sm:px-6',
        maxWidth && MAX_WIDTH_CLASS[maxWidth],
        className,
      )}
      {...props}
    />
  );
});
