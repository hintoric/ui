import { cva } from 'class-variance-authority';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: STATIC_COLOR_CLASSES[variant][color] })),
);

// Sizes/font-sizes are Joy UI's literal px values (32/40/48px boxes, computed
// as a fraction of the box size, not the theme's own font scale). Radius uses
// an arbitrary `50%` rather than Tailwind's `rounded-full` (`calc(infinity *
// 1px)`, computed to a huge literal px number) to match Joy's literal
// computed borderRadius string exactly. Confirmed against @mui/joy's
// Avatar.js source.
export const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[50%] font-body',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      // `leading-none` must come after the text-size utility in each string —
      // tailwind-merge treats a text-size class's built-in line-height and an
      // explicit `leading-*` as the same conflict group, last-one-wins.
      size: {
        sm: 'size-8 text-sm font-medium leading-none',
        md: 'size-10 text-base font-medium leading-none',
        lg: 'size-12 text-lg font-semibold leading-none',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'soft', color: 'neutral', size: 'md' },
  },
);
