export { TABLE_SIZE_CLASS, TABLE_HEAD_CLASS, TABLE_BORDER_AXIS_CLASS } from '../Table/tableVariants';

// Visible only on header hover (the header cell carries `group`), matching
// Blueprint/TanStack's own resize-handle convention; solid-primary while
// actively dragging (`column.getIsResizing()`) gives drag feedback, the same
// highlight idea `HOVER_BG_CLASS` uses elsewhere for JS-driven states.
export const DATAGRID_RESIZE_HANDLE_CLASS =
  'absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none select-none opacity-0 group-hover:opacity-100';

export const DATAGRID_SORT_ICON_CLASS =
  'inline-flex items-center text-base text-ink-icon transition-transform duration-200';
