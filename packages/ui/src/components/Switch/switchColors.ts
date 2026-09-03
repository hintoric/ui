import type { JoyColor } from '../../utils/colorVariantClasses';

// Switch's variant is always fixed at "solid" (unlike Checkbox, which
// switches variant too) — only `color` toggles (neutral unchecked, primary
// checked, unless overridden). Track uses the solid variant's own
// background; the thumb uses that SAME combination's text color as ITS
// background (an inverted color relationship), producing the familiar
// light-thumb-on-dark-track look. CSS custom-property NAMES (not Tailwind
// classes) since these back inline styles, not utility classes. Confirmed
// against @mui/joy's Switch.js source.
export const SWITCH_SOLID_VARS: Record<JoyColor, { track: string; thumb: string }> = {
  primary: { track: 'var(--color-primary-solid-bg)', thumb: 'var(--color-primary-solid-color)' },
  neutral: { track: 'var(--color-neutral-solid-bg)', thumb: 'var(--color-neutral-solid-color)' },
  danger: { track: 'var(--color-danger-solid-bg)', thumb: 'var(--color-danger-solid-color)' },
  success: { track: 'var(--color-success-solid-bg)', thumb: 'var(--color-success-solid-color)' },
  warning: { track: 'var(--color-warning-solid-bg)', thumb: 'var(--color-warning-solid-color)' },
};

export const SWITCH_SIZE = {
  sm: { trackWidth: 26, trackHeight: 16, thumbSize: 10 },
  md: { trackWidth: 32, trackHeight: 20, thumbSize: 14 },
  lg: { trackWidth: 40, trackHeight: 24, thumbSize: 18 },
} as const;
