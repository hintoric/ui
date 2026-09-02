import { cva } from 'class-variance-authority';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SURFACE_COLOR_CLASSES[variant][color] })),
);

export const sheetVariants = cva('rounded-md', {
  variants: {
    variant: { solid: '', soft: '', outlined: '', plain: '' },
    color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
  },
  compoundVariants,
  defaultVariants: { variant: 'plain', color: 'neutral' },
});
