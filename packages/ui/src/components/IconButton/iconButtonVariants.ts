import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'size-8',
        md: 'size-10',
        lg: 'size-12',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'plain', color: 'neutral', size: 'md' },
  },
);
