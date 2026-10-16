import { cva } from 'class-variance-authority';
import { INPUT_COLOR_CLASSES, INPUT_FOCUS_RING_CLASSES, INPUT_WRAPPER_DISABLED_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  // The root is Combobox.InputGroup's <div>, where INPUT_COLOR_CLASSES'
  // `disabled:` half never matches; Base UI sets data-disabled on it instead.
  JOY_COLORS.map((color) => ({
    variant,
    color,
    class: [INPUT_COLOR_CLASSES[variant][color], INPUT_WRAPPER_DISABLED_CLASSES[variant][color]],
  })),
);

// Joy UI's AutocompleteRoot literally extends Input's own StyledInputRoot —
// same color/focus-ring/shadow/size rules apply unchanged. Confirmed against
// @mui/joy's Autocomplete.js source (`styled(StyledInputRoot, ...)`). That
// includes `display: flex`: the root fills its container rather than shrinking
// to content (P1 of the 2026-09-06 audit).
export const autocompleteVariants = cva('flex items-center gap-2 rounded-sm font-body transition-colors cursor-text data-[disabled]:cursor-default', {
  variants: {
    variant: {
      solid: 'shadow-[var(--shadow-xs)]',
      soft: 'shadow-[var(--shadow-xs)]',
      outlined: 'shadow-[var(--shadow-xs)]',
      plain: '',
    },
    color: INPUT_FOCUS_RING_CLASSES,
    // text-sm/[1.5], text-lg/[1.5]: Joy's body-sm/-lg keep line-height 1.5
    // (21px/27px); Tailwind's text-sm/-lg alone carry 20px/28px.
    size: {
      sm: 'min-h-8 px-2 text-sm/[1.5]',
      md: 'min-h-9 px-3 text-base',
      lg: 'min-h-11 px-4 text-lg/[1.5]',
    },
  },
  compoundVariants,
  defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
});
