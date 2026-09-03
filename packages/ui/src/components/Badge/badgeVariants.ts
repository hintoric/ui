import { cva } from 'class-variance-authority';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SURFACE_COLOR_CLASSES[variant][color] })),
);

// Sizes are Joy UI's literal pill dimensions when it carries content (dot-only
// sizes, used when badgeContent is empty, aren't supported in this v1).
// Confirmed against @mui/joy's Badge.js source.
export const badgeDotVariants = cva(
  'absolute top-0 right-0 z-10 box-border flex min-w-max -translate-y-1/2 translate-x-1/2 items-center justify-center font-body font-medium leading-none shadow-[0_0_0_2px_var(--color-surface)]',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      // Radius equals min-height (a pill), as a literal px value rather than
      // `rounded-full` (`calc(infinity * 1px)`, a huge literal number) — same
      // lesson as Avatar/Chip. Confirmed against @mui/joy's Badge.js source.
      size: {
        sm: 'min-h-4 rounded-[1rem] px-1 text-xs',
        md: 'min-h-5 rounded-[1.25rem] px-1.5 text-sm',
        lg: 'min-h-6 rounded-[1.5rem] px-2 text-base',
      },
      invisible: {
        true: 'scale-0',
        false: 'scale-100',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'solid', color: 'primary', size: 'md', invisible: false },
  },
);
