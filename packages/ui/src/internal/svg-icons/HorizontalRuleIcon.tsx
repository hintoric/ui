import type * as React from 'react';

// Matches @mui/joy's internal HorizontalRule icon path exactly (used for the
// indeterminate Checkbox state).
export function HorizontalRuleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 13H5c-.55 0-1-.45-1-1s.45-1 1-1h14c.55 0 1 .45 1 1s-.45 1-1 1z" />
    </svg>
  );
}
