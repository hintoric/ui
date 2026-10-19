import type * as React from 'react';
import type { MailCardIconName } from './spec';
import type { MailCardIconProps, MailCardLogoProps } from './types';

// Material Icons (filled), Apache License 2.0 — path data copied verbatim from @mui/icons-material
// 9.4.0, the icons Gmail's own cards draw. Typed against the name list in spec.ts, so a name
// added there fails to compile until it has a path here.
const PATHS: Record<MailCardIconName, readonly string[]> = {
  person: [
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4',
  ],
  event: [
    'M17 12h-5v5h5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1zm3 18H5V8h14z',
  ],
  place: [
    'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7m0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5',
  ],
  payments: [
    'M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2m-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m13-6v11c0 1.1-.9 2-2 2H4v-2h17V7z',
  ],
  schedule: [
    'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8',
    'M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  ],
  shopping_cart: [
    'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2',
  ],
  local_shipping: [
    'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m13.5-9 1.96 2.5H17V9.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5',
  ],
  receipt: [
    'M18 17H6v-2h12zm0-4H6v-2h12zm0-4H6V7h12zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2z',
  ],
  confirmation_number: [
    'M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2m-9 7.5h-2v-2h2zm0-4.5h-2v-2h2zm0-4.5h-2v-2h2z',
  ],
  store: ['M20 4H4v2h16zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6zm-9 4H6v-4h6z'],
  description: [
    'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 16H8v-2h8zm0-4H8v-2h8zm-3-5V3.5L18.5 9z',
  ],
};

/**
 * A row symbol: 20 px, in the colour of the text around it. Decorative — the label says it. A name
 * it has no path for (a typed `spec` is not parsed) draws nothing, and the row keeps its text edge.
 */
export function MailCardIcon({ name, ...props }: MailCardIconProps) {
  // `hasOwn`, not `PATHS[name]`: a name like `toString` would find a function on the prototype.
  if (!Object.hasOwn(PATHS, name)) return null;
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/*
 * The Hintoric mark with its right-hand stroke, 24 px, in `currentColor`: the part of
 * cdn.hintoric.com/assets/logo/black.svg inside viewBox 0 0 324 326 (the rest of that file is the
 * word mark). `HintoricIcon` is not used because it crops the mark to 282.481 px and so loses the
 * right stroke. The file's clip-path is dropped: it clips nothing inside these paths, and an `id`
 * would repeat with every card on the page.
 */
export function MailCardLogo(props: MailCardLogoProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 324 326"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-mail-card-logo=""
      {...props}
    >
      <path
        d="M224.696 226.063L224.624 208.164L323.964 216.739L224.696 226.063Z"
        fill="currentColor"
      />
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
      <path
        d="M171.659 154.399L153.773 154.471L161.64 0.0377281L171.659 154.399Z"
        fill="currentColor"
      />
      <path
        d="M99.3041 226.063L99.3759 208.164L0.0357722 216.739L99.3041 226.063Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * The arrow of a split button: Material Icons `ArrowDropDown` (filled), Apache License 2.0, path
 * copied verbatim from @mui/icons-material 9.4.0, 24 px, in `currentColor`. Not one of the row
 * icons, so it is not in `MailCardIconName` and a spec cannot ask for it.
 */
export function ArrowDropDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m7 10 5 5 5-5z" />
    </svg>
  );
}

/*
 * The thumbs of the feedback question: Material Icons `ThumbUpOutlined` and `ThumbDownOutlined`,
 * Apache License 2.0, paths copied verbatim from @mui/icons-material 9.4.0 (the outlined hand with
 * a solid cuff, as in Gmail's own feedback). 20 px, in `currentColor`. Like the arrow of a split
 * button they are not row icons, so they are not in `MailCardIconName` and a spec cannot ask for
 * them.
 */
export function ThumbUpOutlinedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2M9 9l4.34-4.34L12 10h9v2l-3 7H9zM1 9h4v12H1z" />
    </svg>
  );
}

export function ThumbDownOutlinedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2m0 12-4.34 4.34L12 14H3v-2l3-7h9zm4-12h4v12h-4z" />
    </svg>
  );
}
