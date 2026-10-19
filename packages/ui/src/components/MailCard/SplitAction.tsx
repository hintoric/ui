'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import { PILL_SURFACE_CLASSES } from './classes';
import { ArrowDropDownIcon } from './icons';
import type { MailCardAlternative } from './spec';

// The main part is the left of the pill and the arrow the right, so the two read as one shape. The
// divider is the on-accent colour at 55 %, an inset 1 px line on the arrow's left edge: it follows
// the arrow's own background through hover and press, and no border width has to be reset for it.
const MAIN_CLASSES = cx(
  PILL_SURFACE_CLASSES,
  'min-w-0 rounded-l-[9999px] py-[8px] pr-[16px] pl-[20px]',
);
const ARROW_CLASSES = cx(
  PILL_SURFACE_CLASSES,
  'box-border w-[36px] shrink-0 rounded-r-[9999px] p-0',
  '[box-shadow:inset_1px_0_0_0_color-mix(in_srgb,var(--mail-card-on-accent)_55%,transparent)]',
);

/*
 * The list opens upwards from the split button, its right edge on the button's, in the card — not
 * in a portal, so it stays inside a shadow root and inherits the card's text rules. It covers the
 * rows above the footer, hence the `z-index`. `max-width: 100cqw` is a safety net on a card too
 * narrow for 320 px: the footer is the size container (`MailCardFooter`), so the list never gets
 * wider than the card's content box, and `max-height` with a scrollbar keeps a list of long items
 * from growing past the card. Colours and the font come from the `--mail-card-*` variables. The
 * list itself takes the focus when a pointer opens it (see `SplitAction`), so it draws no outline
 * of its own: it is a place for the focus to rest, not a control.
 */
const MENU_CLASSES = cx(
  'absolute right-0 bottom-[calc(100%+8px)] z-10 box-border w-[320px] max-w-[100cqw] py-[10px]',
  'max-h-[320px] overflow-y-auto outline-none',
  'rounded-[12px] border border-[var(--mail-card-border)] bg-[var(--mail-card-menu-surface)] text-left',
  '[box-shadow:var(--mail-card-menu-shadow)] [font-family:var(--mail-card-font)]',
);

// The highlighted item is the focused one, and only that one: the pointer moves focus onto the item
// it passes over (`onPointerMove` below), so a hover background of its own would make two. The
// keyboard ring sits inside the item, where the list's rounded edge cannot cut it off.
const ITEM_CLASSES = cx(
  'box-border block w-full min-w-0 cursor-pointer border-0 bg-transparent px-[24px] py-[12px] text-left',
  '[font-family:inherit] focus:bg-[var(--mail-card-menu-hover)]',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--mail-card-focus)]',
);

// The library's `title-sm` and `body-xs` as numbers (typographyVariants.ts): px, because the card
// lives in a page whose root font size is not ours.
const ITEM_LABEL_CLASSES =
  'block text-[14px] leading-[1.42858] font-medium text-[var(--mail-card-title)]';
const ITEM_HINT_CLASSES =
  'mt-[2px] block text-[12px] leading-[1.5] font-medium text-[var(--mail-card-label)]';

const menuItems = (list: HTMLElement | null) =>
  Array.from(list?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

export interface SplitActionProps {
  action: {
    readonly label: string;
    /** The variants behind the arrow: each is a menu item. */
    readonly alternatives: readonly MailCardAlternative[];
  };
  /** The main part was used. */
  onMain(): void;
  /** An item was chosen; the list has closed. */
  onAlternative(alternative: MailCardAlternative): void;
  /** `aria-label` of the arrow, which has no text. */
  moreActionsLabel: string;
  className?: string;
}

/**
 * The primary offer with variants: the main part and an arrow in one pill, the arrow opening a list
 * of `alternatives` above it. The main part does what a plain primary offer does; an item is a
 * variant of it, handed to `onAlternative` whole.
 *
 * A menu button as the WAI-ARIA authoring practices describe it, kept small: opened from the
 * keyboard, it focuses the first item; opened with the pointer, it focuses the list itself and
 * highlights nothing, so the most consequential choice (the first item) is never pre-selected under
 * a mouse user's pointer — as in the Gmail card menu this follows, and as the library's `Menu`
 * does. The arrow keys move between the items and wrap (from the list, `ArrowDown` goes to the
 * first and `ArrowUp` to the last), `Home` and `End` jump; `Escape` closes and gives the focus back
 * to the arrow; so does choosing an item. `Tab` and `Shift+Tab` close it too and go on from the
 * arrow. A pointerdown outside, or the focus leaving some other way, closes it without moving the
 * focus. The pointer moves the focus onto the item it passes over, so at most one item is
 * highlighted, whichever of the two moved last.
 */
export function SplitAction({
  action,
  onMain,
  onAlternative,
  moreActionsLabel,
  className,
}: SplitActionProps) {
  const id = React.useId();
  const arrowId = `${id}-arrow`;
  const menuId = `${id}-menu`;
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const arrowRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Set by a pointerdown inside this component while the list is open, read by the outside check.
  const pointerStartedInside = React.useRef(false);
  // How the list was opened: by the pointer (a click with a position, `detail > 0`) or from the
  // keyboard (Enter or Space on the arrow click with `detail === 0`). Decides what takes the focus.
  const openedWithPointer = React.useRef(false);

  React.useEffect(() => {
    if (!open) return;
    if (openedWithPointer.current) listRef.current?.focus({ preventScroll: true });
    else menuItems(listRef.current)[0]?.focus();
  }, [open]);

  React.useEffect(() => {
    // The document the card is in, which is not always the global one (an iframe, a popout).
    const doc = rootRef.current?.ownerDocument;
    if (!open || !doc) return;
    const onPointerDown = (event: PointerEvent) => {
      // `composedPath()`, not `event.target`: a listener on `document` sees the host of a shadow
      // root as the target of everything inside it. A *closed* root hides its inner nodes from the
      // path altogether, so a pointerdown that React has already seen inside counts as inside.
      const inside =
        pointerStartedInside.current ||
        (rootRef.current !== null && event.composedPath().includes(rootRef.current));
      pointerStartedInside.current = false;
      if (!inside) setOpen(false);
    };
    doc.addEventListener('pointerdown', onPointerDown);
    return () => doc.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) arrowRef.current?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    // The keys the list handles are not the host page's: Gmail has shortcuts of its own, and an
    // `Escape` that reaches it would leave the thread.
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === 'Tab') {
      // Leaving the list closes it. Focus goes to the arrow first, so the browser's own Tab (this
      // is not prevented) goes on from there: forward to what follows the card's button, backward
      // to the main part. Unmounting the focused item first would drop the focus onto `<body>`.
      if (listRef.current?.contains(event.target as Node)) arrowRef.current?.focus();
      setOpen(false);
      return;
    }
    const items = menuItems(listRef.current);
    // Focus on the list itself (a pointer open) counts as "before the first item", so ArrowDown
    // goes to the first item and ArrowUp wraps to the last. Focus anywhere else is not ours.
    const onList = event.target === listRef.current;
    const current = onList ? -1 : items.indexOf(event.target as HTMLElement);
    if (items.length === 0 || (current === -1 && !onList)) return;
    const last = items.length - 1;
    let target: number;
    switch (event.key) {
      case 'ArrowDown':
        target = current === last ? 0 : current + 1;
        break;
      case 'ArrowUp':
        target = current <= 0 ? last : current - 1;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    items[target].focus();
  };

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    // `relatedTarget` is `null` when the window loses focus or something unfocusable is clicked;
    // neither is a reason to close (a click outside closes through the pointerdown above).
    const next = event.relatedTarget as Node | null;
    if (open && next && !event.currentTarget.contains(next)) setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={cx('relative inline-flex max-w-full min-w-0', className)}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      onPointerDown={() => {
        if (open) pointerStartedInside.current = true;
      }}
    >
      <button
        type="button"
        className={MAIN_CLASSES}
        onClick={() => {
          close(false);
          onMain();
        }}
      >
        {action.label}
      </button>
      <button
        ref={arrowRef}
        id={arrowId}
        type="button"
        className={ARROW_CLASSES}
        aria-label={moreActionsLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          openedWithPointer.current = event.detail > 0;
          setOpen((wasOpen) => !wasOpen);
        }}
      >
        <ArrowDropDownIcon />
      </button>
      {open && (
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          tabIndex={-1}
          aria-labelledby={arrowId}
          className={MENU_CLASSES}
        >
          {action.alternatives.map((alternative, i) => {
            const labelId = `${id}-label-${i}`;
            const hintId = alternative.hint ? `${id}-hint-${i}` : undefined;
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                tabIndex={-1}
                aria-labelledby={labelId}
                aria-describedby={hintId}
                className={ITEM_CLASSES}
                onPointerMove={(event) => event.currentTarget.focus({ preventScroll: true })}
                onClick={() => {
                  close(true);
                  onAlternative(alternative);
                }}
              >
                <span id={labelId} className={ITEM_LABEL_CLASSES}>
                  {alternative.label}
                </span>
                {alternative.hint && (
                  <span id={hintId} className={ITEM_HINT_CLASSES}>
                    {alternative.hint}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
