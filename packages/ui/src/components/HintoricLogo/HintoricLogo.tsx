import * as React from 'react';
import { cx } from '../../utils/cx';
import type { HintoricLogoProps } from './types';

/*
 * Verbatim from cdn.hintoric.com/assets/logo/{black,white}.svg — the two
 * asset variants collapse into one component: `black`/`white` fills become
 * `currentColor`, coloured by `text-ink-primary` (overridable via
 * `className`) instead of switching between two SVGs. The ink token already
 * flips with `data-color-scheme` in theme.css, so light/dark works via CSS
 * alone, no useColorScheme() needed. See HintoricIcon for the mark alone.
 */
export const HintoricLogo = React.forwardRef<SVGSVGElement, HintoricLogoProps>(function HintoricLogo(
  { className, 'aria-label': ariaLabel = 'Hintoric', role = 'img', ...props },
  ref,
) {
  // A fixed id would collide if two <HintoricLogo>s render on the same page —
  // `clip-path: url(#id)` resolves against the whole document, not this <svg>.
  const clipId = `hintoric-logo-mark-clip-${React.useId()}`;

  return (
    <svg
      ref={ref}
      width="4.552em"
      height="1em"
      viewBox="0 0 1484 326"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={role}
      aria-label={ariaLabel}
      className={cx('text-ink-primary', className)}
      {...props}
    >
      <path d="M224.696 226.063L224.624 208.164L323.964 216.739L224.696 226.063Z" fill="currentColor" />
      <g clipPath={`url(#${clipId})`}>
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
      </g>
      <path
        d="M398.8 276H376.2V142H398.8V197.6H463.2V142H485.8V276H463.2V217.6H398.8V276ZM572.253 276H549.653V142H572.253V276ZM658.792 276H636.192V142H657.192L711.392 220L724.592 241L723.192 215.6V142H745.792V276H724.992L669.392 196.8L657.192 177.8L658.792 202.2V276ZM852.708 276H830.108V162H789.108V142H893.908V162H852.708V276ZM992.941 277.8C953.541 277.8 926.941 247.6 926.941 208.8C926.941 170.2 953.541 140 992.941 140C1032.14 140 1058.94 170.2 1058.94 208.8C1058.94 247.6 1032.14 277.8 992.941 277.8ZM993.141 256.2C1021.14 256.2 1035.34 236.6 1035.34 208.8C1035.34 181.2 1021.14 161.4 993.141 161.4C965.141 161.4 950.741 181.2 950.741 208.8C950.741 236.6 965.141 256.2 993.141 256.2ZM1136.77 276H1114.17V142H1174.57C1201.77 142 1222.17 156 1222.17 183.6C1222.17 206 1206.77 219.2 1185.77 221.6C1193.77 224 1199.17 229 1203.97 237.4L1226.77 276H1200.77L1177.57 236.2C1172.57 227.2 1165.77 224 1153.17 224H1136.77V276ZM1172.37 162H1136.77V205.6H1172.37C1186.57 205.6 1198.77 200.4 1198.77 184.2C1198.77 167.2 1186.57 162 1172.37 162ZM1296.94 276H1274.34V142H1296.94V276ZM1416.58 277.6C1375.38 277.6 1352.18 247.4 1352.18 208.8C1352.18 170.2 1375.38 140 1416.58 140C1446.18 140 1466.58 155.2 1475.98 181.4L1456.38 195.8C1452.18 175.6 1439.78 161.4 1416.78 161.4C1389.18 161.4 1376.18 181 1376.18 208.8C1376.18 236.4 1389.18 256.2 1416.78 256.2C1439.78 256.2 1452.18 241.8 1456.38 221.8L1475.98 236.2C1466.58 262.2 1446.18 277.6 1416.58 277.6Z"
        fill="currentColor"
      />
      <defs>
        <clipPath id={clipId}>
          <rect width="282.481" height="326" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
});
