import * as React from 'react';
import { cx } from '../../utils/cx';
import type { HintoricIconProps } from './types';

/*
 * Just the mark from the real logo (cdn.hintoric.com/assets/logo/{black,white}.svg),
 * not a separate asset — there is none. The mark is the clip-path group inside
 * that SVG (viewBox 0 0 282.481 326); the rest of the file is the wordmark.
 * The connector "flag" path outside the group runs from x≈99 to x≈324, past
 * the mark's own 282.481-wide clip bounds, so cropping to this viewBox drops
 * it identically to how the original SVG's own clipPath already does.
 *
 * `black`/`white` fills become `currentColor`, coloured by `text-ink-primary`
 * (overridable via `className`) instead of switching between the two asset
 * variants — the ink token already flips with `data-color-scheme` in
 * theme.css, so light/dark works via CSS alone, no useColorScheme() needed.
 */
export const HintoricIcon = React.forwardRef<SVGSVGElement, HintoricIconProps>(function HintoricIcon(
  { className, 'aria-label': ariaLabel = 'Hintoric', role = 'img', ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      width="0.867em"
      height="1em"
      viewBox="0 0 282.481 326"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={role}
      aria-label={ariaLabel}
      className={cx('text-ink-primary', className)}
      {...props}
    >
      <path
        d="M162.146 96.1494C222.522 96.1494 271.48 145.133 271.48 205.575C271.48 266.017 222.522 315 162.146 315C101.771 315 52.8127 266.017 52.8125 205.575C52.8125 145.133 101.771 96.1495 162.146 96.1494Z"
        stroke="currentColor"
        strokeWidth="22"
      />
      <path
        d="M162.146 161.809C191.75 161.809 216.081 186.337 216.081 217.009C216.081 247.68 191.75 272.209 162.146 272.209C132.543 272.209 108.211 247.68 108.211 217.009C108.211 186.337 132.543 161.809 162.146 161.809Z"
        stroke="currentColor"
        strokeWidth="20"
      />
      <path d="M171.659 154.399L153.773 154.471L161.64 0.0377281L171.659 154.399Z" fill="currentColor" />
      <path d="M99.3041 226.063L99.3759 208.164L0.0357722 216.739L99.3041 226.063Z" fill="currentColor" />
    </svg>
  );
});
