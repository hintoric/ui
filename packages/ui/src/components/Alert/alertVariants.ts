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
export const alertVariants = cva('flex items-center rounded-sm font-body font-medium', {
  variants: {
    variant: { solid: '', soft: '', outlined: '', plain: '' },
    color: { primary: '', neutral: '', danger: '', success: '', warning: '' },
    size: {
      sm: 'gap-2 p-2 text-xs',
      md: 'gap-2.5 p-3 text-sm',
      lg: 'gap-3.5 p-4 text-base',
    },
  },
  compoundVariants,
  defaultVariants: { variant: 'soft', color: 'neutral', size: 'md' },
});
