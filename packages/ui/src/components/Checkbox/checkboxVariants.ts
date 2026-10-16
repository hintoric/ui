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
      // `leading-N` matches `size-N`: Joy sets `lineHeight: var(--Checkbox-size)`
      // on the slot this box corresponds to, so the line-height is the box's
      // own dimension rather than a typography ratio. Measured against real
      // @mui/joy 2026-09-07: ours rendered 24px (inherited from the text size)
      // where Joy rendered 20px at `md`.
        sm: 'size-4 leading-4',
        md: 'size-5 leading-5',
        lg: 'size-6 leading-6',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);

// `text-sm/4`, `text-base/5`, `text-lg/6`: Joy sets the root's line-height to
// var(--Checkbox-size) at every size, so the label line is as tall as the box
// (16/20/24px) rather than a typography ratio. Tailwind's bare text-sm/-base/-lg
// carry 20/24/28px; measured against real @mui/joy 2026-10-16.
//
// `text-ink-primary`: Joy paints the root (and so the label) with
// text.primary, dimmed to plainDisabled's colour when disabled. Ours set no
// colour and inherited the page's, which left the label black on a dark
// surface. Base UI marks the box with data-disabled; every colour's
// plain-disabled-color is the same token, so one class covers them all.
export const checkboxRootVariants = cva(
  'inline-flex items-center font-body text-ink-primary has-[[data-disabled]]:text-neutral-plain-disabled-color',
  {
    variants: {
      size: {
        sm: 'gap-2 text-sm/4',
        md: 'gap-2.5 text-base/5',
        lg: 'gap-3 text-lg/6',
      },
    },
    defaultVariants: { size: 'md' },
  },
);
