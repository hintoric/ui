import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';

export { TABLE_SIZE_CLASS, TABLE_HEAD_CLASS, TABLE_BORDER_AXIS_CLASS } from '../Table/tableVariants';

// A sortable header cell needs a real CSS `:hover` background (not the
// permanent background `HOVER_BG_CLASS` gives JS-driven `highlighted` states
// elsewhere, e.g. Option/MenuItem) — but Tailwind's build-time class scanner
// only picks up utility classes that appear as complete literal strings in
// source, so `` `hover:${HOVER_BG_CLASS[v][c]}` `` would silently generate no
// CSS at all. These are the same *-hover-bg tokens from HOVER_BG_CLASS,
// spelled out with the literal `hover:` prefix Tailwind can actually see.
export const DATAGRID_HEADER_HOVER_CLASS: Record<JoyVariant, Record<JoyColor, string>> = {
  solid: {
    primary: 'hover:bg-primary-solid-hover-bg',
    neutral: 'hover:bg-neutral-solid-hover-bg',
    danger: 'hover:bg-danger-solid-hover-bg',
    success: 'hover:bg-success-solid-hover-bg',
    warning: 'hover:bg-warning-solid-hover-bg',
  },
  soft: {
    primary: 'hover:bg-primary-soft-hover-bg',
    neutral: 'hover:bg-neutral-soft-hover-bg',
    danger: 'hover:bg-danger-soft-hover-bg',
    success: 'hover:bg-success-soft-hover-bg',
    warning: 'hover:bg-warning-soft-hover-bg',
  },
  outlined: {
    primary: 'hover:bg-primary-outlined-hover-bg',
    neutral: 'hover:bg-neutral-outlined-hover-bg',
    danger: 'hover:bg-danger-outlined-hover-bg',
    success: 'hover:bg-success-outlined-hover-bg',
    warning: 'hover:bg-warning-outlined-hover-bg',
  },
  plain: {
    primary: 'hover:bg-primary-plain-hover-bg',
    neutral: 'hover:bg-neutral-plain-hover-bg',
    danger: 'hover:bg-danger-plain-hover-bg',
    success: 'hover:bg-success-plain-hover-bg',
    warning: 'hover:bg-warning-plain-hover-bg',
  },
};

// Visible only on header hover (the header cell carries `group`), matching
// Blueprint/TanStack's own resize-handle convention; solid-primary while
// actively dragging (`column.getIsResizing()`) gives drag feedback, the same
// highlight idea `HOVER_BG_CLASS` uses elsewhere for JS-driven states.
export const DATAGRID_RESIZE_HANDLE_CLASS =
  'absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none select-none opacity-0 group-hover:opacity-100';

export const DATAGRID_SORT_ICON_CLASS =
  'inline-flex items-center text-base text-ink-icon transition-transform duration-200';
