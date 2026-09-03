import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

// Joy UI's Slider repurposes each variant/color combination's TEXT color as
// the accent fill (not its own backgroundColor) — the filled indicator uses
// `theme.variants[variant][color].backgroundColor || surface`, and the thumb
// is filled with that SAME variant's `.color` instead (so solid's indicator
// is a colored bar with a white thumb dot; outlined/plain's indicator is a
// surface-filled bar with a colored thumb dot). Confirmed against @mui/joy's
// Slider.js source (`sliderColorVariables`).
//
// Scope note: this is a deliberate simplification of Joy's CSS-variable
// cascade (`--Slider-trackColor`/`-thumbBackground`/etc., reused by hover/
// active/disabled state variants too) down to literal per-variant Tailwind
// classes for the resting state only — no separate hover/active accent
// shift.
export const SLIDER_INDICATOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-bg',
    neutral: 'bg-neutral-solid-bg',
    danger: 'bg-danger-solid-bg',
    success: 'bg-success-solid-bg',
    warning: 'bg-warning-solid-bg',
  },
  soft: {
    primary: 'bg-primary-soft-bg',
    neutral: 'bg-neutral-soft-bg',
    danger: 'bg-danger-soft-bg',
    success: 'bg-success-soft-bg',
    warning: 'bg-warning-soft-bg',
  },
  outlined: {
    primary: 'border border-primary-outlined-border bg-surface',
    neutral: 'border border-neutral-outlined-border bg-surface',
    danger: 'border border-danger-outlined-border bg-surface',
    success: 'border border-success-outlined-border bg-surface',
    warning: 'border border-warning-outlined-border bg-surface',
  },
  plain: {
    primary: 'bg-surface',
    neutral: 'bg-surface',
    danger: 'bg-surface',
    success: 'bg-surface',
    warning: 'bg-surface',
  },
};

export const SLIDER_THUMB_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'bg-primary-solid-color border-primary-solid-bg',
    neutral: 'bg-neutral-solid-color border-neutral-solid-bg',
    danger: 'bg-danger-solid-color border-danger-solid-bg',
    success: 'bg-success-solid-color border-success-solid-bg',
    warning: 'bg-warning-solid-color border-warning-solid-bg',
  },
  soft: {
    primary: 'bg-primary-soft-color border-primary-soft-bg',
    neutral: 'bg-neutral-soft-color border-neutral-soft-bg',
    danger: 'bg-danger-soft-color border-danger-soft-bg',
    success: 'bg-success-soft-color border-success-soft-bg',
    warning: 'bg-warning-soft-color border-warning-soft-bg',
  },
  // Unlike solid/soft/plain (none of which set an explicit borderColor, so
  // the thumb's real border resolves to `currentColor` == its own text
  // color, which happens to already equal what those maps set below),
  // outlined DOES set a real borderColor (its `-outlined-border` token) —
  // confirmed empirically against @mui/joy's actual computed style.
  outlined: {
    primary: 'bg-primary-outlined-color border-primary-outlined-border',
    neutral: 'bg-neutral-outlined-color border-neutral-outlined-border',
    danger: 'bg-danger-outlined-color border-danger-outlined-border',
    success: 'bg-success-outlined-color border-success-outlined-border',
    warning: 'bg-warning-outlined-color border-warning-outlined-border',
  },
  plain: {
    primary: 'bg-primary-plain-color border-surface',
    neutral: 'bg-neutral-plain-color border-surface',
    danger: 'bg-danger-plain-color border-surface',
    success: 'bg-success-plain-color border-surface',
    warning: 'bg-warning-plain-color border-surface',
  },
};

// trackSize / thumbSize per @mui/joy's Slider.js (`--Slider-trackSize`,
// `--Slider-thumbSize`) — Tailwind's default spacing scale happens to hit
// every one of these exactly (4/6/8px and 14/18/24px), so no arbitrary
// values are needed for the sizing itself, only for the radii (Joy's
// `--Slider-trackRadius` is a literal 42px touch-target size, not a
// percentage, and `--Slider-thumbRadius` is half of `--Slider-thumbSize`).
export const SLIDER_TRACK_SIZE_CLASS = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
} as const;

// Same px values as SLIDER_TRACK_SIZE_CLASS, as a `w-*` class for vertical orientation.
export const SLIDER_TRACK_WIDTH_CLASS = {
  sm: 'w-1',
  md: 'w-1.5',
  lg: 'w-2',
} as const;

export const SLIDER_THUMB_SIZE_CLASS = {
  sm: 'h-3.5 w-3.5 rounded-[7px]',
  md: 'h-4.5 w-4.5 rounded-[9px]',
  lg: 'h-6 w-6 rounded-[12px]',
} as const;
