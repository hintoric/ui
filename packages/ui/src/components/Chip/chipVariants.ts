import { cva } from 'class-variance-authority';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SURFACE_COLOR_CLASSES[variant][color] })),
);

// Joy UI's Chip radius defaults to a component-local 1.5rem (24px), not the
// theme's own radius scale — bigger than half of any Chip size's height, so
// it renders as a full pill. Using an arbitrary 1.5rem value (rather than
// Tailwind's `rounded-full` => 9999px) matches Joy's literal computed
// borderRadius string exactly. Confirmed against @mui/joy's Chip.js source.
export const chipVariants = cva(
  'inline-flex max-w-max items-center justify-center whitespace-nowrap align-middle font-body font-medium rounded-[1.5rem]',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-5 gap-[3px] px-1.5 text-xs',
        md: 'min-h-6 gap-1 px-2 text-sm',
        lg: 'min-h-7 gap-1.5 px-3 text-base',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'soft', color: 'neutral', size: 'md' },
  },
);
