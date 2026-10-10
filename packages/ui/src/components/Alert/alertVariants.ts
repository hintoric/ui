import { cva } from 'class-variance-authority';
import { SURFACE_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SURFACE_COLOR_CLASSES[variant][color] })),
);

// Alert explicitly sets `backgroundColor: background.surface` before the
// variant overlay, same fallback mechanism as Sheet/Card/Chip. Radius is
// `theme.vars.radius.sm` (our --radius-sm), not a component-local value.
// Confirmed against @mui/joy's Alert.js source.
// Deliberate deviation from Joy: the row is `items-start`, not `items-center`,
// so decorators stay on the first line of multi-line content.
export const alertVariants = cva('flex items-start rounded-sm font-body font-medium', {
  variants: {
    variant: { solid: '', soft: '', outlined: '', plain: '' },
    color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
    size: {
      sm: 'gap-2 p-2 text-xs/[1.5]',
      md: 'gap-2.5 p-3 text-sm/[1.5]',
      lg: 'gap-3.5 p-4 text-base/[1.5]',
    },
  },
  compoundVariants,
  defaultVariants: { variant: 'soft', color: 'neutral', size: 'md' },
});

// Decorators sit on the first text line: the box is at least one line high
// (`1lh` = the alert's own line-height) and centres its content in it, so an
// icon no taller than a line lines up with a single line exactly as it did
// when the whole row was centred.
export const DECORATOR_CLASSES = 'inline-flex min-h-[1lh] flex-none items-center';
