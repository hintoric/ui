import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const inputVariants = cva(
  'inline-flex items-center gap-2 rounded-md font-body transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-8 px-3 text-sm',
        md: 'min-h-10 px-3 text-base',
        lg: 'min-h-12 px-4 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);
