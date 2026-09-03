import { cva } from 'class-variance-authority';
import { SELECT_COLOR_CLASSES, SELECT_FOCUS_RING_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SELECT_COLOR_CLASSES[variant][color] })),
);

// Same size scale as Input (min-height/padding-inline coincide exactly with
// Joy's --Select-minHeight/--Select-paddingInline values), plus Select's own
// --_Select-paddingBlock (2px/3px/4px) on top. Confirmed against @mui/joy's
// Select.js source.
export const selectVariants = cva(
  'relative inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-sm font-body outline-none transition-colors',
  {
    variants: {
      // Joy UI applies shadow.xs to every variant except plain (same rule as
      // Input's StyledInputRoot).
      variant: {
        solid: 'shadow-[var(--shadow-xs)]',
        soft: 'shadow-[var(--shadow-xs)]',
        outlined: 'shadow-[var(--shadow-xs)]',
        plain: '',
      },
      color: SELECT_FOCUS_RING_CLASSES,
      size: {
        sm: 'min-h-8 gap-2 px-2 py-0.5 text-sm',
        md: 'min-h-9 gap-2 px-3 py-[3px] text-base',
        lg: 'min-h-11 gap-2 px-4 py-1 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);
