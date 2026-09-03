import { cva } from 'class-variance-authority';
import { INPUT_COLOR_CLASSES, INPUT_FOCUS_RING_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INPUT_COLOR_CLASSES[variant][color] })),
);

// Joy UI's AutocompleteRoot literally extends Input's own StyledInputRoot —
// same color/focus-ring/shadow/size rules apply unchanged. Confirmed against
// @mui/joy's Autocomplete.js source (`styled(StyledInputRoot, ...)`).
export const autocompleteVariants = cva('inline-flex items-center gap-2 rounded-sm font-body transition-colors cursor-text', {
  variants: {
    variant: {
      solid: 'shadow-[var(--shadow-xs)]',
      soft: 'shadow-[var(--shadow-xs)]',
      outlined: 'shadow-[var(--shadow-xs)]',
      plain: '',
    },
    color: INPUT_FOCUS_RING_CLASSES,
    size: {
      sm: 'min-h-8 px-2 text-sm',
      md: 'min-h-9 px-3 text-base',
      lg: 'min-h-11 px-4 text-lg',
    },
  },
  compoundVariants,
  defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
});
