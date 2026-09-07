import { cva } from 'class-variance-authority';
import { INPUT_COLOR_CLASSES, INPUT_FOCUS_RING_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INPUT_COLOR_CLASSES[variant][color] })),
);

export const inputVariants = cva('inline-flex items-center gap-2 rounded-sm font-body transition-colors cursor-text', {
  variants: {
    // Joy UI applies shadow.xs to every variant except plain (verified
    // against @mui/joy's StyledInputRoot).
    variant: {
      solid: 'shadow-[var(--shadow-xs)]',
      soft: 'shadow-[var(--shadow-xs)]',
      outlined: 'shadow-[var(--shadow-xs)]',
      plain: '',
    },
    // Carries the focus-ring color for this `color` prop value (see
    // INPUT_FOCUS_RING_CLASSES) — replaces the resting shadow while focused,
    // which is a deliberate simplification of Joy UI's separate `::before`
    // focus overlay (kept as one plain box-shadow instead of layering two).
    color: INPUT_FOCUS_RING_CLASSES,
    // --input-padding-inline mirrors the px-* value in rem so the native
    // input's :-webkit-autofill override (see Input.tsx) can bleed its
    // background to the pill's edge instead of stopping at the input's own
    // zero padding (verified against @mui/joy's StyledInputHtml, which does
    // the same with its --Input-paddingInline var).
    size: {
      sm: 'min-h-8 px-2 text-sm [--input-padding-inline:0.5rem]',
      md: 'min-h-9 px-3 text-base [--input-padding-inline:0.75rem]',
      lg: 'min-h-11 px-4 text-lg [--input-padding-inline:1rem]',
    },
  },
  compoundVariants,
  defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
});
