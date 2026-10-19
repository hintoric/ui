import { cx } from '../../utils/cx';

/*
 * The class strings that `blocks.tsx` (the plain pill and the text link) and `SplitAction.tsx` (the
 * pill in two parts) both paint with. In a module of their own because `blocks.tsx` renders
 * `SplitAction`: constants in either of the two would make the other depend on it.
 */

// `Button`'s focus ring as it renders (buttonVariants.ts, where tailwind-merge folds `outline` into
// `outline-2`): 2 px, 2 px off the edge, in a colour from the theme — primary-500 in joy, as there.
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mail-card-focus)]';

/**
 * What every part of the primary action has in common — the plain pill and both halves of the split
 * one: 36 px high at least, 14 px / 500, in the accent colour, darkening on hover and press like a
 * solid primary `Button`. The shape and the padding are the caller's. Built by hand rather than on
 * `Button` because every colour has to come from the theme's variables, and `Button` paints from
 * Joy's tokens in all of its states.
 */
export const PILL_SURFACE_CLASSES = cx(
  'inline-flex min-h-[36px] cursor-pointer items-center justify-center border-0',
  'text-center text-[14px]/[20px] font-medium no-underline transition-colors',
  'bg-[var(--mail-card-accent)] text-[var(--mail-card-on-accent)]',
  'hover:bg-[var(--mail-card-accent-hover)] active:bg-[var(--mail-card-accent-active)]',
  FOCUS_RING,
);
