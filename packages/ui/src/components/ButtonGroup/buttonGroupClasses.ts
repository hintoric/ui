import { cx } from '../../utils/cx';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

// Joy's `StyledButtonGroup` (ButtonGroup.js, @mui/joy 5.0.0-beta.52), which its
// ToggleButtonGroup reuses unchanged. The look lives on the children, not the
// root: each child gets a separator border on the side facing its neighbour,
// the outer corners keep `radius.sm` while the inner ones drop to 0 when the
// buttons touch, and every child after the first is pulled back by the
// separator width so neighbouring borders overlap instead of doubling.
//
// The CSS variable names are Joy's own, so these rules can be read against
// ButtonGroup.js line by line. The children are tagged `data-first-child` /
// `data-last-child` by the group, exactly as Joy does; a middle child has
// neither. ButtonGroup leaves an only child untagged, as Joy does, which is
// why the middle-child and overlap rules also exclude `:only-child`.
//
// `--ButtonGroup-childRadius` stands in for Joy's `--unstable_childRadius`,
// `calc((1 - connected) * radius - var(--variant-borderWidth, 0px))`. That
// `var()` resolves on the group, where `--variant-borderWidth` is never set,
// so it is simply 0 when connected and `radius.sm` when spaced — measured,
// not assumed: the spacing case of the visual test compares every corner.

const SEPARATOR_COLOR: Record<JoyColor, string> = {
  primary:
    '[--ButtonGroup-separatorColor:var(--color-primary-outlined-border)] [&_button:disabled]:[--ButtonGroup-separatorColor:var(--color-primary-outlined-disabled-border)]',
  neutral:
    '[--ButtonGroup-separatorColor:var(--color-neutral-outlined-border)] [&_button:disabled]:[--ButtonGroup-separatorColor:var(--color-neutral-outlined-disabled-border)]',
  danger:
    '[--ButtonGroup-separatorColor:var(--color-danger-outlined-border)] [&_button:disabled]:[--ButtonGroup-separatorColor:var(--color-danger-outlined-disabled-border)]',
  success:
    '[--ButtonGroup-separatorColor:var(--color-success-outlined-border)] [&_button:disabled]:[--ButtonGroup-separatorColor:var(--color-success-outlined-disabled-border)]',
  warning:
    '[--ButtonGroup-separatorColor:var(--color-warning-outlined-border)] [&_button:disabled]:[--ButtonGroup-separatorColor:var(--color-warning-outlined-disabled-border)]',
};

const HORIZONTAL = [
  'flex-row',
  '[&>[data-first-child]]:[border-right:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>[data-last-child]]:[border-left:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-left:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-right:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>[data-first-child]:not([data-last-child])]:[border-radius:var(--radius-sm)_var(--ButtonGroup-childRadius)_var(--ButtonGroup-childRadius)_var(--radius-sm)]',
  '[&>[data-last-child]:not([data-first-child])]:[border-radius:var(--ButtonGroup-childRadius)_var(--radius-sm)_var(--radius-sm)_var(--ButtonGroup-childRadius)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-radius:var(--ButtonGroup-childRadius)]',
  '[&>:not([data-first-child]):not(:only-child)]:[margin-left:calc(var(--ButtonGroup-separatorSize)*-1)]',
].join(' ');

const VERTICAL = [
  'flex-col',
  '[&>[data-first-child]]:[border-bottom:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>[data-last-child]]:[border-top:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-top:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-bottom:var(--ButtonGroup-separatorSize)_solid_var(--ButtonGroup-separatorColor)]',
  '[&>[data-first-child]:not([data-last-child])]:[border-radius:var(--radius-sm)_var(--radius-sm)_var(--ButtonGroup-childRadius)_var(--ButtonGroup-childRadius)]',
  '[&>[data-last-child]:not([data-first-child])]:[border-radius:var(--ButtonGroup-childRadius)_var(--ButtonGroup-childRadius)_var(--radius-sm)_var(--radius-sm)]',
  '[&>:not([data-first-child]):not([data-last-child]):not(:only-child)]:[border-radius:var(--ButtonGroup-childRadius)]',
  '[&>:not([data-first-child]):not(:only-child)]:[margin-top:calc(var(--ButtonGroup-separatorSize)*-1)]',
].join(' ');

/** `spacing` 0 / "0px" / "0rem" connects the buttons — Joy's `/^0(?!\.)/` test. */
export function isConnected(spacing: number | string): boolean {
  return /^0(?!\.)/.test(spacing.toString());
}

/** Joy's `theme.spacing(n)`: a number is a multiple of 8px, a string is used as-is. */
export function groupGap(spacing: number | string): string {
  return typeof spacing === 'number' ? `calc(var(--spacing) * ${spacing * 2})` : spacing;
}

export function buttonGroupClasses({
  variant,
  color,
  orientation,
  connected,
}: {
  variant: JoyVariant;
  color: JoyColor;
  orientation: 'horizontal' | 'vertical';
  connected: boolean;
}): string {
  return cx(
    'flex rounded-sm',
    // Outlined buttons keep a 1px separator even when spaced apart (it is
    // their own border colour, so it reads as their border); the other
    // variants only get one while they touch.
    variant === 'outlined' || connected
      ? '[--ButtonGroup-separatorSize:1px]'
      : '[--ButtonGroup-separatorSize:0px]',
    connected ? '[--ButtonGroup-childRadius:0px]' : '[--ButtonGroup-childRadius:var(--radius-sm)]',
    SEPARATOR_COLOR[color],
    // Enabled buttons sit above disabled ones, and a hovered or focused one
    // above its neighbours, so the overlapping border shown is the right one.
    '[&_button:not(:disabled)]:z-1 [&_button:not(:disabled):hover]:z-2 [&_button:not(:disabled):focus-visible]:z-2',
    orientation === 'vertical' ? VERTICAL : HORIZONTAL,
  );
}
