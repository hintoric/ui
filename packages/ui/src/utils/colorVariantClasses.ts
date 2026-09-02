export type JoyVariant = 'solid' | 'soft' | 'outlined' | 'plain';
export type JoyColor = 'primary' | 'neutral' | 'danger' | 'success' | 'warning';

// Every string below is a COMPLETE literal Tailwind class list. Do not refactor
// this into a template-literal helper like `bg-${color}-solid-bg` — Tailwind's
// v4 content scanner only recognizes complete literal tokens in source files,
// so an interpolated name would silently stop generating CSS for it.
export const INTERACTIVE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg text-primary-solid-color hover:bg-primary-solid-hover-bg active:bg-primary-solid-active-bg disabled:bg-primary-solid-disabled-bg disabled:text-primary-solid-disabled-color',
    neutral: 'bg-neutral-solid-bg text-neutral-solid-color hover:bg-neutral-solid-hover-bg active:bg-neutral-solid-active-bg disabled:bg-neutral-solid-disabled-bg disabled:text-neutral-solid-disabled-color',
    danger: 'bg-danger-solid-bg text-danger-solid-color hover:bg-danger-solid-hover-bg active:bg-danger-solid-active-bg disabled:bg-danger-solid-disabled-bg disabled:text-danger-solid-disabled-color',
    success: 'bg-success-solid-bg text-success-solid-color hover:bg-success-solid-hover-bg active:bg-success-solid-active-bg disabled:bg-success-solid-disabled-bg disabled:text-success-solid-disabled-color',
    warning: 'bg-warning-solid-bg text-warning-solid-color hover:bg-warning-solid-hover-bg active:bg-warning-solid-active-bg disabled:bg-warning-solid-disabled-bg disabled:text-warning-solid-disabled-color',
  },
  soft: {
    primary: 'bg-primary-soft-bg text-primary-soft-color hover:bg-primary-soft-hover-bg active:bg-primary-soft-active-bg active:text-primary-soft-active-color disabled:bg-primary-soft-disabled-bg disabled:text-primary-soft-disabled-color',
    neutral: 'bg-neutral-soft-bg text-neutral-soft-color hover:bg-neutral-soft-hover-bg active:bg-neutral-soft-active-bg active:text-neutral-soft-active-color disabled:bg-neutral-soft-disabled-bg disabled:text-neutral-soft-disabled-color',
    danger: 'bg-danger-soft-bg text-danger-soft-color hover:bg-danger-soft-hover-bg active:bg-danger-soft-active-bg active:text-danger-soft-active-color disabled:bg-danger-soft-disabled-bg disabled:text-danger-soft-disabled-color',
    success: 'bg-success-soft-bg text-success-soft-color hover:bg-success-soft-hover-bg active:bg-success-soft-active-bg active:text-success-soft-active-color disabled:bg-success-soft-disabled-bg disabled:text-success-soft-disabled-color',
    warning: 'bg-warning-soft-bg text-warning-soft-color hover:bg-warning-soft-hover-bg active:bg-warning-soft-active-bg active:text-warning-soft-active-color disabled:bg-warning-soft-disabled-bg disabled:text-warning-soft-disabled-color',
  },
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-transparent hover:bg-primary-outlined-hover-bg active:bg-primary-outlined-active-bg disabled:text-primary-outlined-disabled-color disabled:border-primary-outlined-disabled-border',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-transparent hover:bg-neutral-outlined-hover-bg active:bg-neutral-outlined-active-bg disabled:text-neutral-outlined-disabled-color disabled:border-neutral-outlined-disabled-border',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-transparent hover:bg-danger-outlined-hover-bg active:bg-danger-outlined-active-bg disabled:text-danger-outlined-disabled-color disabled:border-danger-outlined-disabled-border',
    success: 'border border-success-outlined-border text-success-outlined-color bg-transparent hover:bg-success-outlined-hover-bg active:bg-success-outlined-active-bg disabled:text-success-outlined-disabled-color disabled:border-success-outlined-disabled-border',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-transparent hover:bg-warning-outlined-hover-bg active:bg-warning-outlined-active-bg disabled:text-warning-outlined-disabled-color disabled:border-warning-outlined-disabled-border',
  },
  plain: {
    primary: 'text-primary-plain-color bg-transparent hover:bg-primary-plain-hover-bg active:bg-primary-plain-active-bg disabled:text-primary-plain-disabled-color',
    neutral: 'text-neutral-plain-color bg-transparent hover:bg-neutral-plain-hover-bg active:bg-neutral-plain-active-bg disabled:text-neutral-plain-disabled-color',
    danger: 'text-danger-plain-color bg-transparent hover:bg-danger-plain-hover-bg active:bg-danger-plain-active-bg disabled:text-danger-plain-disabled-color',
    success: 'text-success-plain-color bg-transparent hover:bg-success-plain-hover-bg active:bg-success-plain-active-bg disabled:text-success-plain-disabled-color',
    warning: 'text-warning-plain-color bg-transparent hover:bg-warning-plain-hover-bg active:bg-warning-plain-active-bg disabled:text-warning-plain-disabled-color',
  },
};

export const SURFACE_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg text-primary-solid-color',
    neutral: 'bg-neutral-solid-bg text-neutral-solid-color',
    danger: 'bg-danger-solid-bg text-danger-solid-color',
    success: 'bg-success-solid-bg text-success-solid-color',
    warning: 'bg-warning-solid-bg text-warning-solid-color',
  },
  soft: {
    primary: 'bg-primary-soft-bg text-primary-soft-color',
    neutral: 'bg-neutral-soft-bg text-neutral-soft-color',
    danger: 'bg-danger-soft-bg text-danger-soft-color',
    success: 'bg-success-soft-bg text-success-soft-color',
    warning: 'bg-warning-soft-bg text-warning-soft-color',
  },
  // Joy UI's StyledSheetRoot falls back to `theme.vars.palette.background.surface`
  // whenever a variant doesn't define its own backgroundColor — outlined and
  // plain don't, so real Sheet/Card in these variants render with a `surface`
  // fill, not a transparent one. Confirmed against the actual @mui/joy package.
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-surface',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-surface',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-surface',
    success: 'border border-success-outlined-border text-success-outlined-color bg-surface',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-surface',
  },
  plain: {
    primary: 'text-primary-plain-color bg-surface',
    neutral: 'text-neutral-plain-color bg-surface',
    danger: 'text-danger-plain-color bg-surface',
    success: 'text-success-plain-color bg-surface',
    warning: 'text-warning-plain-color bg-surface',
  },
};

// Input/Textarea share Button/IconButton's palette but not their interaction
// styling: Joy UI's StyledInputRoot explicitly sets `backgroundColor: null` on
// hover (no hover fill) and, like Sheet, falls back to `background.surface`
// for outlined/plain instead of staying transparent. There's no `:active`
// treatment for Input in Joy UI either. Confirmed against @mui/joy.
export const INPUT_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg text-primary-solid-color disabled:bg-primary-solid-disabled-bg disabled:text-primary-solid-disabled-color',
    neutral: 'bg-neutral-solid-bg text-neutral-solid-color disabled:bg-neutral-solid-disabled-bg disabled:text-neutral-solid-disabled-color',
    danger: 'bg-danger-solid-bg text-danger-solid-color disabled:bg-danger-solid-disabled-bg disabled:text-danger-solid-disabled-color',
    success: 'bg-success-solid-bg text-success-solid-color disabled:bg-success-solid-disabled-bg disabled:text-success-solid-disabled-color',
    warning: 'bg-warning-solid-bg text-warning-solid-color disabled:bg-warning-solid-disabled-bg disabled:text-warning-solid-disabled-color',
  },
  soft: {
    primary: 'bg-primary-soft-bg text-primary-soft-color disabled:bg-primary-soft-disabled-bg disabled:text-primary-soft-disabled-color',
    neutral: 'bg-neutral-soft-bg text-neutral-soft-color disabled:bg-neutral-soft-disabled-bg disabled:text-neutral-soft-disabled-color',
    danger: 'bg-danger-soft-bg text-danger-soft-color disabled:bg-danger-soft-disabled-bg disabled:text-danger-soft-disabled-color',
    success: 'bg-success-soft-bg text-success-soft-color disabled:bg-success-soft-disabled-bg disabled:text-success-soft-disabled-color',
    warning: 'bg-warning-soft-bg text-warning-soft-color disabled:bg-warning-soft-disabled-bg disabled:text-warning-soft-disabled-color',
  },
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-surface disabled:text-primary-outlined-disabled-color disabled:border-primary-outlined-disabled-border',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-surface disabled:text-neutral-outlined-disabled-color disabled:border-neutral-outlined-disabled-border',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-surface disabled:text-danger-outlined-disabled-color disabled:border-danger-outlined-disabled-border',
    success: 'border border-success-outlined-border text-success-outlined-color bg-surface disabled:text-success-outlined-disabled-color disabled:border-success-outlined-disabled-border',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-surface disabled:text-warning-outlined-disabled-color disabled:border-warning-outlined-disabled-border',
  },
  plain: {
    primary: 'text-primary-plain-color bg-surface disabled:text-primary-plain-disabled-color',
    neutral: 'text-neutral-plain-color bg-surface disabled:text-neutral-plain-disabled-color',
    danger: 'text-danger-plain-color bg-surface disabled:text-danger-plain-disabled-color',
    success: 'text-success-plain-color bg-surface disabled:text-success-plain-disabled-color',
    warning: 'text-warning-plain-color bg-surface disabled:text-warning-plain-disabled-color',
  },
};

// Joy UI's Input focuses with an INSET ring flush against its border (no
// outline offset/gap), colored by `--Input-focusedHighlight`, which maps
// `color="neutral"` to primary-500 and every other color to its own 500.
// Confirmed against @mui/joy's real focus-within `::before` box-shadow.
export const INPUT_FOCUS_RING_CLASSES: Record<JoyColor, string> = {
  primary: 'focus-within:shadow-[inset_0_0_0_2px_var(--color-primary-500)]',
  neutral: 'focus-within:shadow-[inset_0_0_0_2px_var(--color-primary-500)]',
  danger: 'focus-within:shadow-[inset_0_0_0_2px_var(--color-danger-500)]',
  success: 'focus-within:shadow-[inset_0_0_0_2px_var(--color-success-500)]',
  warning: 'focus-within:shadow-[inset_0_0_0_2px_var(--color-warning-500)]',
};
