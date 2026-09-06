import { cva } from 'class-variance-authority';
import { SELECT_COLOR_CLASSES, SELECT_FOCUS_RING_CLASSES } from '../../utils/colorVariantClasses';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

const JOY_VARIANTS: JoyVariant[] = ['solid', 'soft', 'outlined', 'plain'];
const JOY_COLORS: JoyColor[] = ['primary', 'neutral', 'danger', 'success', 'warning'];

const compoundVariants = JOY_VARIANTS.flatMap((variant) =>
  JOY_COLORS.map((color) => ({ variant, color, class: SELECT_COLOR_CLASSES[variant][color] })),
);

// Same size scale as Input (min-height/padding-inline coincide exactly with
// Joy's --Select-minHeight/--Select-paddingInline values), plus Select's own
// --_Select-paddingBlock (2px/3px/4px) on top. Confirmed against @mui/joy's
// Select.js source.
export const selectVariants = cva(
  // `flex`, not `inline-flex`: Joy's SelectRoot is a block-level flex
  // container (Select.js `display: 'flex'`), so it fills its parent's
  // inline size the way a form field is expected to. An inline-flex root
  // shrinks to its content instead — a visible divergence.
  //
  // No `gap` here either: Joy spaces the slots with `--Select-gap` margins
  // on the decorators and the indicator (see Select.tsx), not with a flex
  // gap on the root, and the indicator additionally pulls back toward the
  // edge. A root gap cannot reproduce either rule.
  // `w-full` on top of `flex`: a <button> keeps a shrink-to-fit `auto`
  // width in Chrome even as a block-level flex container, so `flex`
  // alone does not reproduce Joy's fill-the-parent behaviour — Joy's
  // root is a <div>, which fills on its own. Ours is Base UI's trigger
  // <button>, so the width has to be asked for explicitly.
  'relative flex w-full min-w-0 cursor-pointer items-center rounded-sm font-body outline-none transition-colors disabled:cursor-default',
  {
    variants: {
      // Joy UI applies shadow.xs to every variant except plain (same rule as
      // Input's StyledInputRoot).
      variant: {
        solid: 'shadow-[var(--shadow-xs)]',
        soft: 'shadow-[var(--shadow-xs)]',
        outlined: 'shadow-[var(--shadow-xs)]',
        plain: '',
      },
      color: SELECT_FOCUS_RING_CLASSES,
      size: {
        sm: 'min-h-8 px-2 py-0.5 text-sm',
        md: 'min-h-9 px-3 py-[3px] text-base',
        lg: 'min-h-11 px-4 py-1 text-lg',
      },
    },
    compoundVariants,
    defaultVariants: { variant: 'outlined', color: 'neutral', size: 'md' },
  },
);
