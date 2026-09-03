import { cva } from 'class-variance-authority';
import { CHECKBOX_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: CHECKBOX_COLOR_CLASSES[variant][color] })),
);

// Radio's box shares Checkbox's exact background formula (surface fallback +
// hover/active), but its radius is a literal px value equal to its own size
// (not Tailwind's `rounded-full`, which computes to a huge literal number) —
// confirmed against @mui/joy's Radio.js source.
export const radioBoxVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center transition-colors cursor-pointer data-[disabled]:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'size-4 rounded-[16px]',
        md: 'size-5 rounded-[20px]',
        lg: 'size-6 rounded-[24px]',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);

export const radioRootVariants = cva('inline-flex items-center font-body', {
  variants: {
    size: {
      sm: 'gap-2 text-sm',
      md: 'gap-2.5 text-base',
      lg: 'gap-3 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});
