import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

// Joy UI's LinearProgress has a real quirk: for variant="soft" the TRACK is
// always the neutral soft background regardless of `color` (only the moving
// bar picks up the color), and for variant="solid" the track is that color's
// `softHover` background rather than its own `solid` background — the bar in
// both cases uses the color's full `solid` background. outlined/plain fall
// back to their own base variant styling (border/transparent + text color).
// Confirmed against @mui/joy's LinearProgress.js source.
export const LINEAR_PROGRESS_VARS: Record<JoyVariant, Record<JoyColor, { track: string; bar: string }>> = {
  solid: {
    primary: { track: 'var(--color-primary-soft-hover-bg)', bar: 'var(--color-primary-solid-bg)' },
    neutral: { track: 'var(--color-neutral-soft-hover-bg)', bar: 'var(--color-neutral-solid-bg)' },
    danger: { track: 'var(--color-danger-soft-hover-bg)', bar: 'var(--color-danger-solid-bg)' },
    success: { track: 'var(--color-success-soft-hover-bg)', bar: 'var(--color-success-solid-bg)' },
    warning: { track: 'var(--color-warning-soft-hover-bg)', bar: 'var(--color-warning-solid-bg)' },
  },
  soft: {
    primary: { track: 'var(--color-neutral-soft-bg)', bar: 'var(--color-primary-solid-bg)' },
    neutral: { track: 'var(--color-neutral-soft-bg)', bar: 'var(--color-neutral-solid-bg)' },
    danger: { track: 'var(--color-neutral-soft-bg)', bar: 'var(--color-danger-solid-bg)' },
    success: { track: 'var(--color-neutral-soft-bg)', bar: 'var(--color-success-solid-bg)' },
    warning: { track: 'var(--color-neutral-soft-bg)', bar: 'var(--color-warning-solid-bg)' },
  },
  outlined: {
    primary: { track: 'transparent', bar: 'var(--color-primary-outlined-color)' },
    neutral: { track: 'transparent', bar: 'var(--color-neutral-outlined-color)' },
    danger: { track: 'transparent', bar: 'var(--color-danger-outlined-color)' },
    success: { track: 'transparent', bar: 'var(--color-success-outlined-color)' },
    warning: { track: 'transparent', bar: 'var(--color-warning-outlined-color)' },
  },
  plain: {
    primary: { track: 'transparent', bar: 'var(--color-primary-plain-color)' },
    neutral: { track: 'transparent', bar: 'var(--color-neutral-plain-color)' },
    danger: { track: 'transparent', bar: 'var(--color-danger-plain-color)' },
    success: { track: 'transparent', bar: 'var(--color-success-plain-color)' },
    warning: { track: 'transparent', bar: 'var(--color-warning-plain-color)' },
  },
};

export const LINEAR_PROGRESS_THICKNESS = { sm: 4, md: 6, lg: 8 } as const;
