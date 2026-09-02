import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm font-body font-medium transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-8 px-3 text-sm',
        md: 'min-h-9 px-4 text-base',
        lg: 'min-h-11 px-6 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'solid', color: 'primary', size: 'md' },
  },
);
