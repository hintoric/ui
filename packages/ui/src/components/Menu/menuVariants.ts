import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

// Same shape as SURFACE_COLOR_CLASSES (outlined/plain fall back to a filled
// background rather than staying transparent), but Menu's own fallback is
// `background.popup` specifically, not the plain `background.surface` Card/
// Sheet/Chip use. Confirmed against @mui/joy's Menu.js source.
export const MENU_COLOR_CLASSES: Record<JoyVariant, Record<JoyColor, string>> = {
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
  outlined: {
    primary: 'border border-primary-outlined-border text-primary-outlined-color bg-surface-popup',
    neutral: 'border border-neutral-outlined-border text-neutral-outlined-color bg-surface-popup',
    danger: 'border border-danger-outlined-border text-danger-outlined-color bg-surface-popup',
    success: 'border border-success-outlined-border text-success-outlined-color bg-surface-popup',
    warning: 'border border-warning-outlined-border text-warning-outlined-color bg-surface-popup',
  },
  plain: {
    primary: 'text-primary-plain-color bg-surface-popup',
    neutral: 'text-neutral-plain-color bg-surface-popup',
    danger: 'text-danger-plain-color bg-surface-popup',
    success: 'text-success-plain-color bg-surface-popup',
    warning: 'text-warning-plain-color bg-surface-popup',
  },
};
