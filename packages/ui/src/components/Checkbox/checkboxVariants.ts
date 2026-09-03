import { cva } from 'class-variance-authority';
import { CHECKBOX_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: CHECKBOX_COLOR_CLASSES[variant][color] })),
);

// Box radius is `min(theme.radius.sm, 0.25rem)` = min(6px, 4px) = 4px.
// Sizes are Joy UI's literal --Checkbox-size custom property values (16/20/24px).
// Confirmed against @mui/joy's Checkbox.js source.
export const checkboxBoxVariants = cva(
  // Joy UI's disabled Checkbox box computes to cursor: default, not
  // not-allowed — confirmed against the real @mui/joy package.
  'relative inline-flex shrink-0 items-center justify-center rounded-[4px] transition-colors cursor-pointer data-[disabled]:cursor-default focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);

export const checkboxRootVariants = cva('inline-flex items-center font-body', {
  variants: {
    size: {
      sm: 'gap-2 text-sm',
      md: 'gap-2.5 text-base',
      lg: 'gap-3 text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});
