'use client';
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnSizingFeature,
  columnResizingFeature,
  createSortedRowModel,
} from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import type { UseDataGridOptions, UseDataGridResult } from './types';

// TanStack Table v9 replaced v8's `useReactTable({ getSortedRowModel:
// getSortedRowModel(), ... })` API with explicit feature composition via
// `tableFeatures()`. This is registered ONCE at module scope (TanStack's own
// docs recommend this, and it must be stable across renders) — confirmed
// against the real package's type definitions and a runtime test, since the
// classic `useReactTable` shape only exists in v9 as the `@deprecated`
// `useLegacyTable` under a `/legacy` import path.
export const dataGridFeatures = tableFeatures({
  rowSortingFeature,
  columnSizingFeature,
  columnResizingFeature,
  sortedRowModel: createSortedRowModel(),
});

export function useDataGrid<TData extends RowData>({
  columns,
  data,
  enableSorting = true,
  enableColumnResizing = true,
  sorting,
  onSortingChange,
  columnSizing,
  onColumnSizingChange,
}: UseDataGridOptions<TData>): UseDataGridResult<TData> {
  const table = useTable({
    features: dataGridFeatures,
    columns,
    data,
    enableSorting,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    state: {
      ...(sorting !== undefined ? { sorting } : {}),
      ...(columnSizing !== undefined ? { columnSizing } : {}),
    },
    // Explicitly setting `onSortingChange`/`onColumnSizingChange` to
    // `undefined` (rather than omitting the key entirely) overrides
    // TanStack's own `makeStateUpdater(...)` default wired by each
    // feature's `getDefaultTableOptions` — that default is what makes
    // UNCONTROLLED sorting/resizing work. Verified with a failing test
    // during design: passing these unconditionally silently broke
    // sort-on-click. Only include the key when the caller actually
    // provided a controlled callback.
    ...(onSortingChange !== undefined ? { onSortingChange } : {}),
    ...(onColumnSizingChange !== undefined ? { onColumnSizingChange } : {}),
  });

  return { table };
}
