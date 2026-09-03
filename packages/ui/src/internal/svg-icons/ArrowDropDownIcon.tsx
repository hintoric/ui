import type * as React from 'react';

// Matches @mui/joy's internal ArrowDropDown icon path (Autocomplete's default popup indicator).
export function ArrowDropDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}
