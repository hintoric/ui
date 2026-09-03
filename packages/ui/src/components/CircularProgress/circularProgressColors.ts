import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

// CSS custom-property NAMES (not Tailwind classes) for the track/progress
// stroke colors — SVG `stroke` isn't a Tailwind-utility target, so this maps
// straight to the same tokens colorVariantClasses.ts's maps reference,
// mirroring Joy UI's own `--CircularProgress-trackColor: backgroundColor` /
// `progressColor: color` (theme.variants[variant][color]).
export const CIRCULAR_PROGRESS_VARS: Record<JoyVariant, Record<JoyColor, { track: string; progress: string }>> = {
  solid: {
    primary: { track: 'var(--color-primary-solid-bg)', progress: 'var(--color-primary-solid-color)' },
    neutral: { track: 'var(--color-neutral-solid-bg)', progress: 'var(--color-neutral-solid-color)' },
    danger: { track: 'var(--color-danger-solid-bg)', progress: 'var(--color-danger-solid-color)' },
    success: { track: 'var(--color-success-solid-bg)', progress: 'var(--color-success-solid-color)' },
    warning: { track: 'var(--color-warning-solid-bg)', progress: 'var(--color-warning-solid-color)' },
  },
  soft: {
    primary: { track: 'var(--color-primary-soft-bg)', progress: 'var(--color-primary-soft-color)' },
    neutral: { track: 'var(--color-neutral-soft-bg)', progress: 'var(--color-neutral-soft-color)' },
    danger: { track: 'var(--color-danger-soft-bg)', progress: 'var(--color-danger-soft-color)' },
    success: { track: 'var(--color-success-soft-bg)', progress: 'var(--color-success-soft-color)' },
    warning: { track: 'var(--color-warning-soft-bg)', progress: 'var(--color-warning-soft-color)' },
  },
  outlined: {
    primary: { track: 'transparent', progress: 'var(--color-primary-outlined-color)' },
    neutral: { track: 'transparent', progress: 'var(--color-neutral-outlined-color)' },
    danger: { track: 'transparent', progress: 'var(--color-danger-outlined-color)' },
    success: { track: 'transparent', progress: 'var(--color-success-outlined-color)' },
    warning: { track: 'transparent', progress: 'var(--color-warning-outlined-color)' },
  },
  plain: {
    primary: { track: 'transparent', progress: 'var(--color-primary-plain-color)' },
    neutral: { track: 'transparent', progress: 'var(--color-neutral-plain-color)' },
    danger: { track: 'transparent', progress: 'var(--color-danger-plain-color)' },
    success: { track: 'transparent', progress: 'var(--color-success-plain-color)' },
    warning: { track: 'transparent', progress: 'var(--color-warning-plain-color)' },
  },
};

export const CIRCULAR_PROGRESS_SIZE = {
  sm: { size: 24, thickness: 3 },
  md: { size: 40, thickness: 6 },
  lg: { size: 64, thickness: 8 },
} as const;
