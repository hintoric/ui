import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

// `font-body font-medium` measured against real @mui/joy 5.0.0-beta.52
// (2026-09-07): its IconButton.js sets `fontFamily: fontFamily.body` and
// `fontWeight: fontWeight.md` (500), and ours set neither, so any text child
// inherited the page's 400 in the body font. Found the same way Button's type
// scale was — by comparing font properties, which nothing in the suite did
// until the colour-scheme retrofit added them.
export const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-sm font-body font-medium transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'size-8',
        md: 'size-9',
        lg: 'size-11',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'plain', color: 'neutral', size: 'md' },
  },
);
