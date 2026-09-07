import { cva } from 'class-variance-authority';
import { INTERACTIVE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: INTERACTIVE_COLOR_CLASSES[variant][color] })),
);

// Typography measured against real @mui/joy 5.0.0-beta.52 (2026-09-07), after
// a green 852-test suite had missed a divergence at every size — no assertion
// compared a font property until the colour-scheme retrofit added one.
//
// Joy's Button.js takes fontWeight from `fontWeight.lg` (600) — it is the only
// component that does; every other one uses `fontWeight.md` (500), which is
// what `font-medium` gives and why the rest of the library is correct.
//
// Its fontSize comes from `fontSize.sm` for BOTH sm and md, and `fontSize.md`
// for lg — 14/14/16px, not the naive 14/16/18 progression `text-sm`/`text-base`
// /`text-lg` produces. `lineHeight` is `lineHeight.md` (1.5) throughout, which
// Tailwind's size classes do not give on their own: `text-sm` ships 1.25rem
// (20px) where Joy wants 21px. A separate `leading-*` utility does not fix
// that — measured, both `leading-normal` and `leading-[1.5]` lost to the
// line-height `text-sm` pairs with, leaving 20px — so the line-height rides
// along on the size utility itself as `text-sm/[1.5]`. 1.5 is Joy's measured
// `lineHeight.md`, not a Tailwind preset that happens to be close.
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm font-body font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: { solid: '', soft: '', outlined: '', plain: '' },
      color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
      size: {
        sm: 'min-h-8 px-3 text-sm/[1.5]',
        md: 'min-h-9 px-4 text-sm/[1.5]',
        lg: 'min-h-11 px-6 text-base/[1.5]',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'solid', color: 'primary', size: 'md' },
  },
);
