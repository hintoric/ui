import type { TableBorderAxis } from './types';

// Joy UI's `--TableCell-height`/`-paddingX`/`-paddingY` per size, plus the
// shifted-down body-typography mapping (sm->body-xs/12px, md->body-sm/14px,
// lg->body-md/16px — same shift Alert/Badge/Chip use). Confirmed against
// @mui/joy's Table.js source. Tailwind's default scale hits every px value
// here exactly, so no arbitrary values are needed.
export const TABLE_SIZE_CLASS = {
  sm: '[&_th]:h-8 [&_td]:h-8 [&_th]:px-1 [&_td]:px-1 [&_th]:py-1 [&_td]:py-1 text-xs',
  md: '[&_th]:h-10 [&_td]:h-10 [&_th]:px-2 [&_td]:px-2 [&_th]:py-1.5 [&_td]:py-1.5 text-sm',
  lg: '[&_th]:h-12 [&_td]:h-12 [&_th]:px-3 [&_td]:px-3 [&_th]:py-2 [&_td]:py-2 text-base',
} as const;

// Head cells always get a surface fill, fontWeight.lg (600 — Tailwind's
// `font-semibold`, NOT `font-bold`/700) text, and secondary text color —
// regardless of `noWrap`, they also always truncate (only data cells make
// that conditional). Confirmed against @mui/joy's Table.js (`getHeadCell`)
// and the real `theme.fontWeight.lg` value (600), not the formula's name.
export const TABLE_HEAD_CLASS =
  '[&_th]:bg-surface [&_th]:text-left [&_th]:align-bottom [&_th]:font-semibold [&_th]:text-ink-secondary [&_th]:overflow-hidden [&_th]:text-ellipsis [&_th]:whitespace-nowrap';

// `:last-of-type` is scoped per-parent, so a lone `<thead><tr>` always
// counts as its own last-of-type regardless of how many `<tbody><tr>`s
// follow it — a blanket `tr:not(:last-of-type)` selector spanning the whole
// table silently never matches the header row. Header rows and body rows
// are therefore targeted with separate selectors (mirroring Joy's own
// separate `getHeaderCell()`/`getBodyCellExceptLastRow()` rules).
const ROW_BETWEEN =
  '[&_thead_tr>*]:border-b [&_thead_tr>*]:border-divider [&_tbody_tr:not(:last-of-type)>*]:border-b [&_tbody_tr:not(:last-of-type)>*]:border-divider';
const ROW_OUTER =
  '[&_thead_tr:first-of-type>th]:border-t [&_thead_tr:first-of-type>th]:border-divider [&_tbody_tr:last-of-type>*]:border-b [&_tbody_tr:last-of-type>*]:border-divider';
const COL_BETWEEN = '[&_tr>*:not(:first-of-type)]:border-l [&_tr>*:not(:first-of-type)]:border-divider';
const COL_OUTER =
  '[&_tr>*:first-of-type]:border-l [&_tr>*:first-of-type]:border-divider [&_tr>*:last-of-type]:border-r [&_tr>*:last-of-type]:border-divider';

// Simplified from Joy UI's exact selector set (which special-cases a 2px
// header underline and scopes "except last row" separately per thead/tbody)
// down to a uniform 1px row/column divider — the CSS-specificity fight
// needed to make a `:not()`-scoped 1px rule lose to an unscoped 2px one
// isn't worth winning for a header underline nobody will notice missing.
// Confirmed row/column border semantics against @mui/joy's Table.js source.
export const TABLE_BORDER_AXIS_CLASS: Record<TableBorderAxis, string> = {
  none: '',
  xBetween: ROW_BETWEEN,
  x: `${ROW_BETWEEN} ${ROW_OUTER}`,
  yBetween: COL_BETWEEN,
  y: `${COL_BETWEEN} ${COL_OUTER}`,
  bothBetween: `${ROW_BETWEEN} ${COL_BETWEEN}`,
  both: `${ROW_BETWEEN} ${ROW_OUTER} ${COL_BETWEEN} ${COL_OUTER}`,
};
