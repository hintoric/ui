// Row sizing shared by ListItem and ListItemButton. Each reads the
// `--list-item-*` variables its List sets per size (Joy's `--ListItem-*`
// cascade); the fallbacks are the md values, so a row outside any List keeps
// Joy's md defaults: 36px min-height, 4px 12px padding, 10px gap.
export const LIST_ITEM_SIZE_CLASS =
  'min-h-[var(--list-item-min-h,2.25rem)] px-[var(--list-item-px,0.75rem)] py-[var(--list-item-py,0.25rem)] gap-[var(--list-item-gap,0.625rem)]';
