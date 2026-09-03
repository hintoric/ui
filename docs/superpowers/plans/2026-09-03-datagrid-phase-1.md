# DataGrid Phase 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `DataGrid` component family to `@hintoric/ui`, built on `@tanstack/react-table` v9's headless row-model/sorting/column-resizing logic and styled with the library's existing design tokens, as the first of four planned phases toward a full spreadsheet-like grid.

**Architecture:** A single `useDataGrid` hook wraps TanStack Table v9's `useTable` with a fixed, module-scoped feature composition (sorting + column sizing/resizing). A `DataGridContext` threads style props (`variant`/`color`/`size`/`borderAxis`) to presentational subcomponents (`DataGridRow`, `DataGridHeaderCell`, `DataGridCell`), which reuse `Table`'s existing style-class maps so a `<DataGrid>` looks identical to a `<Table>` with the same props. `DataGrid` itself dispatches between a "shorthand" mode (pass `columns`+`data`, get a fully-rendered grid) and a "compound" mode (pass a `table` from `useDataGrid` plus custom `<thead>`/`<tbody>` markup built from the same subcomponents) — both funnel into one internal `DataGridShell` that owns the actual `<table>` element and its `<colgroup>`.

**Tech Stack:** React 19, TypeScript, `@tanstack/react-table` v9 (`useTable` + `tableFeatures()` composition — NOT the deprecated v8-style `useReactTable`/`useLegacyTable`), Tailwind CSS v4, `class-variance-authority`-free (reuses existing `cx`/`colorVariantClasses` utilities), Vitest (jsdom unit tests + real-browser self-baseline visual tests).

**Spec:** [docs/superpowers/specs/2026-09-03-datagrid-phase-1-design.md](../specs/2026-09-03-datagrid-phase-1-design.md)

## Global Constraints

- Every new/modified component still needs full visual regression coverage per `CLAUDE.md` — but for `DataGrid` specifically, the spec's Section 2 approves a documented exception: **self-baseline `toMatchScreenshot()` only, no `getComputedStyle()`-vs-`@mui/joy` comparison**, because Joy UI has no DataGrid equivalent to compare against.
- `@tanstack/react-table` pin: `^9.2.4` (the version verified against during design — v9 replaced the classic `useReactTable` API; see spec Section 3).
- `TData extends RowData` (TanStack's own constraint, `RowData = Record<string, any> | Array<any>`) must be on every generic type/function that takes a `TData` type parameter — omitting it produces confusing "not assignable to RowData" errors deep in TanStack's types, not a clear error at the omission site.
- `onSortingChange`/`onColumnSizingChange` must **only** be included in the options object passed to `useTable` when the caller actually provided one (conditionally spread, never passed as an explicit `undefined` value) — TanStack's features wire up their own internal default state-updater via `getDefaultTableOptions`, and explicitly setting the key to `undefined` overrides that default, silently breaking uncontrolled sorting/resizing. This was caught by a real failing test during design verification, not theoretical.
- `columnResizeMode: 'onChange'` (not the v9 default `'onEnd'`) so resize handles commit live, matching the spec's described drag feedback.
- Every DataGrid subcomponent lives as a sibling file inside `packages/ui/src/components/DataGrid/` (not its own top-level component folder) — this is a deliberate, already-approved deviation from the one-folder-per-component convention used by Table/Accordion/Tabs/etc., because these pieces are tightly coupled and only meaningful together.
- Explicit `<thead>`/`<tbody>` tags are required (not optional) in both shorthand and compound rendering — `Table`'s reused `TABLE_BORDER_AXIS_CLASS` selectors target `thead`/`tbody` rows separately (`[&_thead_tr>*]`, `[&_tbody_tr:not(:last-of-type)>*]`); without literal tags the border classes silently do nothing.
- Use `row.getAllCells()`, not `row.getVisibleCells()` — the latter requires `columnVisibilityFeature`, which Phase 1 does not register.

---

## Task 1: Add the `@tanstack/react-table` dependency

**Files:**
- Modify: `packages/ui/package.json`

**Interfaces:**
- Produces: the `@tanstack/react-table` package available to import from every subsequent task.

- [ ] **Step 1: Add the dependency**

In `packages/ui/package.json`, add to the `"dependencies"` object (alongside `class-variance-authority`, `clsx`, `tailwind-merge`):

```json
"@tanstack/react-table": "^9.2.4",
```

- [ ] **Step 2: Install**

Run from the repo root:

```bash
pnpm install
```

- [ ] **Step 3: Verify the install**

Run:

```bash
node -e "console.log(require('/Users/johanneswaigel/git/hintoric/ui/packages/ui/node_modules/@tanstack/react-table/package.json').version)"
```

Expected: prints a `9.x` version string (e.g. `9.2.4`).

- [ ] **Step 4: Commit**

```bash
git add packages/ui/package.json pnpm-lock.yaml
git commit -m "chore: add @tanstack/react-table dependency for DataGrid"
```

---

## Task 2: `useDataGrid` hook and core types

**Files:**
- Create: `packages/ui/src/components/DataGrid/types.ts`
- Create: `packages/ui/src/components/DataGrid/useDataGrid.ts`
- Test: `packages/ui/src/components/DataGrid/useDataGrid.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first component-level task).
- Produces: `dataGridFeatures` (module-scoped `tableFeatures(...)` composition), `useDataGrid<TData extends RowData>(options: UseDataGridOptions<TData>): UseDataGridResult<TData>`, and the type aliases `DataGridColumnDef<TData, TValue>`, `DataGridTable<TData>`, `DataGridHeader<TData>`, `DataGridRowInstance<TData>`, `DataGridCellInstance<TData>`, `DataGridColumn<TData>`, `DataGridStyleProps`, `DataGridShorthandProps<TData>`, `DataGridCompoundProps<TData>`, `DataGridProps<TData>`, `DataGridRowProps`, `DataGridHeaderCellProps<TData>`, `DataGridCellProps<TData>` — all subsequent tasks import from this file.

- [ ] **Step 1: Write `types.ts`**

```ts
import type * as React from 'react';
import type {
  Cell,
  Column,
  ColumnDef,
  Header,
  OnChangeFn,
  Row,
  RowData,
  SortingState,
  ColumnSizingState,
  Table,
} from '@tanstack/react-table';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { TableBorderAxis } from '../Table';
import type { dataGridFeatures } from './useDataGrid';

// TanStack Table v9's ColumnDef/Table/Header/Row/Cell are generic over the
// concrete feature set (`TFeatures`), not just `TData` as in v8. Since this
// library fixes the feature set once at module scope (see useDataGrid.ts),
// these aliases bind `TFeatures` to it so consumers only ever deal with
// `TData` — never the underlying `dataGridFeatures` type.
export type DataGridFeatures = typeof dataGridFeatures;

export type DataGridColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<DataGridFeatures, TData, TValue>;
export type DataGridTable<TData extends RowData> = Table<DataGridFeatures, TData>;
export type DataGridHeader<TData extends RowData> = Header<DataGridFeatures, TData, unknown>;
export type DataGridRowInstance<TData extends RowData> = Row<DataGridFeatures, TData>;
export type DataGridCellInstance<TData extends RowData> = Cell<DataGridFeatures, TData, unknown>;
export type DataGridColumn<TData extends RowData> = Column<DataGridFeatures, TData, unknown>;

export interface UseDataGridOptions<TData extends RowData> {
  columns: ReadonlyArray<DataGridColumnDef<TData>>;
  data: ReadonlyArray<TData>;
  enableSorting?: boolean;
  enableColumnResizing?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
}

export interface UseDataGridResult<TData extends RowData> {
  table: DataGridTable<TData>;
}

export interface DataGridStyleProps {
  variant?: JoyVariant;
  color?: JoyColor;
  size?: 'sm' | 'md' | 'lg';
  borderAxis?: TableBorderAxis;
}

type DataGridTableHtmlProps = Omit<React.ComponentPropsWithoutRef<'table'>, 'color' | 'children'>;

// Shorthand mode (`columns`+`data`) and compound mode (`table`+`children`)
// are mutually exclusive — the `?: undefined` fields on each branch make
// this a real discriminated union, so passing neither shape (or mixing
// them) is a compile error, not a silent runtime fallback.
export type DataGridShorthandProps<TData extends RowData> = DataGridStyleProps &
  DataGridTableHtmlProps &
  UseDataGridOptions<TData> & {
    table?: undefined;
    children?: undefined;
  };

export type DataGridCompoundProps<TData extends RowData> = DataGridStyleProps &
  DataGridTableHtmlProps & {
    table: DataGridTable<TData>;
    children: React.ReactNode;
    columns?: undefined;
    data?: undefined;
  };

export type DataGridProps<TData extends RowData> = DataGridShorthandProps<TData> | DataGridCompoundProps<TData>;

export type DataGridRowProps = React.ComponentPropsWithoutRef<'tr'>;

export type DataGridHeaderCellProps<TData extends RowData> = Omit<React.ComponentPropsWithoutRef<'th'>, 'children'> & {
  header: DataGridHeader<TData>;
};

export type DataGridCellProps<TData extends RowData> = Omit<React.ComponentPropsWithoutRef<'td'>, 'children'> & {
  cell: DataGridCellInstance<TData>;
};
```

- [ ] **Step 2: Write `useDataGrid.ts`**

```ts
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
```

- [ ] **Step 3: Write the failing test**

```tsx
// packages/ui/src/components/DataGrid/useDataGrid.test.tsx
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataGrid } from './useDataGrid';
import type { DataGridColumnDef } from './types';

interface Person {
  name: string;
  age: number;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age' },
];

const data: Person[] = [
  { name: 'Beta', age: 2 },
  { name: 'Alpha', age: 1 },
];

describe('useDataGrid', () => {
  it('returns a table whose row model reflects the given data', () => {
    const { result } = renderHook(() => useDataGrid<Person>({ columns, data }));
    const rows = result.current.table.getRowModel().rows;
    expect(rows.map((row) => row.original.name)).toEqual(['Beta', 'Alpha']);
  });

  it('sorts uncontrolled (no sorting/onSortingChange passed) when a column is toggled', () => {
    const { result } = renderHook(() => useDataGrid<Person>({ columns, data }));
    act(() => {
      result.current.table.getColumn('name')?.toggleSorting(false); // ascending
    });
    const rows = result.current.table.getRowModel().rows;
    expect(rows.map((row) => row.original.name)).toEqual(['Alpha', 'Beta']);
  });

  it('supports controlled sorting via sorting + onSortingChange', () => {
    let sorting: import('@tanstack/react-table').SortingState = [];
    const onSortingChange = (updater: unknown) => {
      sorting = typeof updater === 'function' ? updater(sorting) : updater;
    };
    const { result, rerender } = renderHook(
      ({ sorting: s }) => useDataGrid<Person>({ columns, data, sorting: s, onSortingChange }),
      { initialProps: { sorting } },
    );
    act(() => {
      result.current.table.getColumn('name')?.toggleSorting(false);
    });
    rerender({ sorting });
    const rows = result.current.table.getRowModel().rows;
    expect(rows.map((row) => row.original.name)).toEqual(['Alpha', 'Beta']);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- useDataGrid`
Expected: FAIL — `Cannot find module './useDataGrid'` (or similar), since `useDataGrid.ts` doesn't exist until Step 2 is actually saved to disk. If Steps 1-2 were already written before running, this step instead confirms Step 3's assertions pass; either ordering is fine as long as you observe a real failure before the fix and a real pass after — re-run Step 5 regardless.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- useDataGrid`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/DataGrid/types.ts packages/ui/src/components/DataGrid/useDataGrid.ts packages/ui/src/components/DataGrid/useDataGrid.test.tsx
git commit -m "feat: add useDataGrid hook wrapping TanStack Table v9's useTable"
```

---

## Task 3: `DataGridContext` and `dataGridVariants`

**Files:**
- Create: `packages/ui/src/components/DataGrid/DataGridContext.ts`
- Create: `packages/ui/src/components/DataGrid/dataGridVariants.ts`
- Test: `packages/ui/src/components/DataGrid/DataGridContext.test.tsx`

**Interfaces:**
- Consumes: `TableBorderAxis` from `../Table` (`packages/ui/src/components/Table/types.ts`, already exported via `components/Table/index.ts`); `TABLE_SIZE_CLASS`/`TABLE_HEAD_CLASS`/`TABLE_BORDER_AXIS_CLASS` from `../Table/tableVariants` (internal file, imported directly by relative path — these are already-verified-against-Joy tokens, reused rather than re-derived per `CLAUDE.md`).
- Produces: `DataGridContext`, `useDataGridContext(): DataGridContextValue` (throws outside a provider), `DATAGRID_RESIZE_HANDLE_CLASS`, `DATAGRID_SORT_ICON_CLASS`, and re-exports of `TABLE_SIZE_CLASS`/`TABLE_HEAD_CLASS`/`TABLE_BORDER_AXIS_CLASS` — consumed by Tasks 5 and 7.

- [ ] **Step 1: Write `DataGridContext.ts`**

```ts
import * as React from 'react';
import type { JoyColor, JoyVariant } from '../../utils/colorVariantClasses';
import type { TableBorderAxis } from '../Table';

export interface DataGridContextValue {
  variant: JoyVariant;
  color: JoyColor;
  size: 'sm' | 'md' | 'lg';
  borderAxis: TableBorderAxis;
}

export const DataGridContext = React.createContext<DataGridContextValue | undefined>(undefined);

export function useDataGridContext(): DataGridContextValue {
  const context = React.useContext(DataGridContext);
  if (!context) {
    throw new Error('DataGrid subcomponents (DataGridHeaderCell, DataGridRow, DataGridCell) must be rendered within a <DataGrid>.');
  }
  return context;
}
```

- [ ] **Step 2: Write `dataGridVariants.ts`**

```ts
export { TABLE_SIZE_CLASS, TABLE_HEAD_CLASS, TABLE_BORDER_AXIS_CLASS } from '../Table/tableVariants';

// Visible only on header hover (the header cell carries `group`), matching
// Blueprint/TanStack's own resize-handle convention; solid-primary while
// actively dragging (`column.getIsResizing()`) gives drag feedback, the same
// highlight idea `HOVER_BG_CLASS` uses elsewhere for JS-driven states.
export const DATAGRID_RESIZE_HANDLE_CLASS =
  'absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize touch-none select-none opacity-0 group-hover:opacity-100';

export const DATAGRID_SORT_ICON_CLASS =
  'inline-flex items-center text-base text-ink-icon transition-transform duration-200';
```

- [ ] **Step 3: Write the failing test**

```tsx
// packages/ui/src/components/DataGrid/DataGridContext.test.tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGridContext, useDataGridContext } from './DataGridContext';

function Consumer() {
  const { size } = useDataGridContext();
  return <span data-testid="size">{size}</span>;
}

describe('useDataGridContext', () => {
  it('throws when used outside a DataGridContext.Provider', () => {
    // Suppress React's expected "error boundary" console noise for this case.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/must be rendered within a <DataGrid>/);
    spy.mockRestore();
  });

  it('returns the provided value inside a Provider', () => {
    render(
      <DataGridContext.Provider value={{ variant: 'plain', color: 'neutral', size: 'lg', borderAxis: 'xBetween' }}>
        <Consumer />
      </DataGridContext.Provider>,
    );
    expect(screen.getByTestId('size')).toHaveTextContent('lg');
  });
});
```

Note: this file needs `vi` imported from `vitest` — add `import { describe, expect, it, vi } from 'vitest';` (the snippet above already shows the full intended import line as the first line of the block; write it exactly as one `import` statement).

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- DataGridContext`
Expected: FAIL if the files from Steps 1-2 aren't saved yet, or PASS if they are (this task's real content is small enough that writing test-then-implementation in the listed step order still gives you a genuine red-then-green cycle if you run the test immediately after Step 3, before Steps 1-2).

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- DataGridContext`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/components/DataGrid/DataGridContext.ts packages/ui/src/components/DataGrid/DataGridContext.test.tsx packages/ui/src/components/DataGrid/dataGridVariants.ts
git commit -m "feat: add DataGridContext and dataGridVariants for DataGrid styling"
```

---

## Task 4: `DataGridRow`

**Files:**
- Create: `packages/ui/src/components/DataGrid/DataGridRow.tsx`
- Test: `packages/ui/src/components/DataGrid/DataGridRow.test.tsx`

**Interfaces:**
- Consumes: `cx` from `../../utils/cx`; `DataGridRowProps` from `./types` (Task 2).
- Produces: `DataGridRow` (a `React.forwardRef<HTMLTableRowElement, DataGridRowProps>` component) — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGridRow } from './DataGridRow';

describe('DataGridRow', () => {
  it('renders a table row element', () => {
    render(
      <table>
        <tbody>
          <DataGridRow data-testid="row">
            <td>cell</td>
          </DataGridRow>
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row').tagName).toBe('TR');
  });

  it('forwards className and other props', () => {
    render(
      <table>
        <tbody>
          <DataGridRow data-testid="row" className="custom-class" />
        </tbody>
      </table>,
    );
    expect(screen.getByTestId('row')).toHaveClass('custom-class');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- DataGridRow`
Expected: FAIL with "Cannot find module './DataGridRow'".

- [ ] **Step 3: Write `DataGridRow.tsx`**

```tsx
'use client';
import * as React from 'react';
import { cx } from '../../utils/cx';
import type { DataGridRowProps } from './types';

export const DataGridRow = React.forwardRef<HTMLTableRowElement, DataGridRowProps>(function DataGridRow(
  { className, ...props },
  ref,
) {
  return <tr ref={ref} className={cx(className)} {...props} />;
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- DataGridRow`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/DataGrid/DataGridRow.tsx packages/ui/src/components/DataGrid/DataGridRow.test.tsx
git commit -m "feat: add DataGridRow component"
```

---

## Task 5: `DataGridHeaderCell`

**Files:**
- Create: `packages/ui/src/components/DataGrid/DataGridHeaderCell.tsx`
- Test: `packages/ui/src/components/DataGrid/DataGridHeaderCell.test.tsx`

**Interfaces:**
- Consumes: `cx` (`../../utils/cx`), `HOVER_BG_CLASS` (`../../utils/colorVariantClasses`), `ArrowDropDownIcon` (`../../internal/svg-icons/ArrowDropDownIcon`), `useDataGridContext` + `DataGridContext` (Task 3), `DATAGRID_RESIZE_HANDLE_CLASS`/`DATAGRID_SORT_ICON_CLASS` (Task 3), `flexRender` (`@tanstack/react-table`), `DataGridHeader<TData>`/`DataGridHeaderCellProps<TData>` (Task 2), `useDataGrid` (Task 2, test-only, to build a real `header` object to pass in).
- Produces: `DataGridHeaderCell` (generic `forwardRef` component, `<TData extends RowData>(props: DataGridHeaderCellProps<TData> & {ref?}) => ReactElement`) — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { DataGridContext } from './DataGridContext';
import { DataGridHeaderCell } from './DataGridHeaderCell';
import { useDataGrid } from './useDataGrid';
import type { DataGridColumnDef } from './types';

interface Person {
  name: string;
  age: number;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'age', header: 'Age', enableSorting: false },
];

const data: Person[] = [{ name: 'Alpha', age: 1 }];

function renderHeaderCell(columnId: 'name' | 'age') {
  const { result } = renderHook(() => useDataGrid<Person>({ columns, data }));
  const header = result.current.table.getHeaderGroups()[0]!.headers.find((h) => h.column.id === columnId)!;
  render(
    <DataGridContext.Provider value={{ variant: 'plain', color: 'neutral', size: 'md', borderAxis: 'xBetween' }}>
      <table>
        <thead>
          <tr>
            <DataGridHeaderCell header={header} />
          </tr>
        </thead>
      </table>
    </DataGridContext.Provider>,
  );
  return header;
}

describe('DataGridHeaderCell', () => {
  it('renders the column header content', () => {
    renderHeaderCell('name');
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });

  it('is clickable and cursor-pointer when the column can sort', () => {
    renderHeaderCell('name');
    const cell = screen.getByRole('columnheader', { name: 'Name' });
    expect(cell).toHaveClass('cursor-pointer');
    expect(cell.onclick).not.toBeNull();
  });

  it('is not clickable when the column has sorting disabled', () => {
    renderHeaderCell('age');
    const cell = screen.getByRole('columnheader', { name: 'Age' });
    expect(cell).not.toHaveClass('cursor-pointer');
  });

  it('renders a resize handle when the column can resize', () => {
    renderHeaderCell('name');
    const cell = screen.getByRole('columnheader', { name: 'Name' });
    expect(cell.querySelector('div')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- DataGridHeaderCell`
Expected: FAIL with "Cannot find module './DataGridHeaderCell'".

- [ ] **Step 3: Write `DataGridHeaderCell.tsx`**

```tsx
'use client';
import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import { cx } from '../../utils/cx';
import { HOVER_BG_CLASS } from '../../utils/colorVariantClasses';
import { ArrowDropDownIcon } from '../../internal/svg-icons/ArrowDropDownIcon';
import { useDataGridContext } from './DataGridContext';
import { DATAGRID_RESIZE_HANDLE_CLASS, DATAGRID_SORT_ICON_CLASS } from './dataGridVariants';
import type { DataGridHeaderCellProps } from './types';

function DataGridHeaderCellInner<TData extends RowData>(
  { header, className, ...props }: DataGridHeaderCellProps<TData>,
  ref: React.Ref<HTMLTableCellElement>,
) {
  const { variant, color } = useDataGridContext();
  const canSort = header.column.getCanSort();
  const sortDirection = header.column.getIsSorted();
  const canResize = header.column.getCanResize();

  return (
    <th
      ref={ref}
      colSpan={header.colSpan}
      className={cx(
        'group relative',
        canSort && cx('cursor-pointer select-none', HOVER_BG_CLASS[variant][color]),
        className,
      )}
      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
      {...props}
    >
      {header.isPlaceholder ? null : (
        <span className="inline-flex items-center gap-1">
          {flexRender(header.column.columnDef.header, header.getContext())}
          {canSort && (
            <span
              aria-hidden="true"
              className={cx(
                DATAGRID_SORT_ICON_CLASS,
                sortDirection === 'asc' && 'rotate-180',
                !sortDirection && 'opacity-40',
              )}
            >
              <ArrowDropDownIcon />
            </span>
          )}
        </span>
      )}
      {canResize && (
        <div
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          className={cx(DATAGRID_RESIZE_HANDLE_CLASS, header.column.getIsResizing() && 'bg-primary-solid-bg opacity-100')}
        />
      )}
    </th>
  );
}

type DataGridHeaderCellComponentType = (<TData extends RowData>(
  props: DataGridHeaderCellProps<TData> & { ref?: React.Ref<HTMLTableCellElement> },
) => React.ReactElement) & { displayName?: string };

// Generic component + forwardRef: same `as unknown as` cast pattern already
// used by Select/Autocomplete in this library, since `forwardRef` itself
// doesn't support generic type parameters.
export const DataGridHeaderCell = React.forwardRef(DataGridHeaderCellInner) as unknown as DataGridHeaderCellComponentType;
DataGridHeaderCell.displayName = 'DataGridHeaderCell';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- DataGridHeaderCell`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/DataGrid/DataGridHeaderCell.tsx packages/ui/src/components/DataGrid/DataGridHeaderCell.test.tsx
git commit -m "feat: add DataGridHeaderCell with sort click handling and resize handle"
```

---

## Task 6: `DataGridCell`

**Files:**
- Create: `packages/ui/src/components/DataGrid/DataGridCell.tsx`
- Test: `packages/ui/src/components/DataGrid/DataGridCell.test.tsx`

**Interfaces:**
- Consumes: `cx` (`../../utils/cx`), `flexRender` (`@tanstack/react-table`), `DataGridCellProps<TData>` (Task 2), `useDataGrid` (Task 2, test-only).
- Produces: `DataGridCell` (generic `forwardRef` component) — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { DataGridCell } from './DataGridCell';
import { useDataGrid } from './useDataGrid';
import type { DataGridColumnDef } from './types';

interface Person {
  name: string;
}

const columns: DataGridColumnDef<Person>[] = [{ accessorKey: 'name', header: 'Name' }];
const data: Person[] = [{ name: 'Alpha' }];

describe('DataGridCell', () => {
  it("renders the cell's rendered value", () => {
    const { result } = renderHook(() => useDataGrid<Person>({ columns, data }));
    const cell = result.current.table.getRowModel().rows[0]!.getAllCells()[0]!;
    render(
      <table>
        <tbody>
          <tr>
            <DataGridCell cell={cell} />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @hintoric/ui test -- DataGridCell`
Expected: FAIL with "Cannot find module './DataGridCell'".

- [ ] **Step 3: Write `DataGridCell.tsx`**

```tsx
'use client';
import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import { cx } from '../../utils/cx';
import type { DataGridCellProps } from './types';

function DataGridCellInner<TData extends RowData>(
  { cell, className, ...props }: DataGridCellProps<TData>,
  ref: React.Ref<HTMLTableCellElement>,
) {
  return (
    <td ref={ref} className={cx(className)} {...props}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}

type DataGridCellComponentType = (<TData extends RowData>(
  props: DataGridCellProps<TData> & { ref?: React.Ref<HTMLTableCellElement> },
) => React.ReactElement) & { displayName?: string };

export const DataGridCell = React.forwardRef(DataGridCellInner) as unknown as DataGridCellComponentType;
DataGridCell.displayName = 'DataGridCell';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @hintoric/ui test -- DataGridCell`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/DataGrid/DataGridCell.tsx packages/ui/src/components/DataGrid/DataGridCell.test.tsx
git commit -m "feat: add DataGridCell component"
```

---

## Task 7: `DataGrid` root component (shorthand + compound)

**Files:**
- Create: `packages/ui/src/components/DataGrid/DataGrid.tsx`
- Test: `packages/ui/src/components/DataGrid/DataGrid.test.tsx`

**Interfaces:**
- Consumes: `cx` (`../../utils/cx`), `STATIC_COLOR_CLASSES` (`../../utils/colorVariantClasses`), `TABLE_SIZE_CLASS`/`TABLE_HEAD_CLASS`/`TABLE_BORDER_AXIS_CLASS` (`./dataGridVariants`, Task 3), `DataGridContext` (Task 3), `DataGridRow` (Task 4), `DataGridHeaderCell` (Task 5), `DataGridCell` (Task 6), `useDataGrid` (Task 2), `DataGridStyleProps`/`DataGridShorthandProps`/`DataGridCompoundProps`/`DataGridProps`/`DataGridTable` (Task 2).
- Produces: `DataGrid` — the family's main public export, consumed by Task 8 (barrel) and Task 9 (visual tests).

This is the largest task in the plan; it's kept as one task (rather than split further) because the shell/shorthand/compound/dispatcher pieces are only meaningful and testable together — a reviewer could not sensibly approve one without the others.

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { DataGrid } from './DataGrid';
import { DataGridRow } from './DataGridRow';
import { DataGridHeaderCell } from './DataGridHeaderCell';
import { DataGridCell } from './DataGridCell';
import { useDataGrid } from './useDataGrid';
import type { DataGridColumnDef } from './types';
import type { SortingState, ColumnSizingState } from '@tanstack/react-table';

interface Person {
  name: string;
  age: number;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 150 },
  { accessorKey: 'age', header: 'Age', size: 100 },
];

const data: Person[] = [
  { name: 'Beta', age: 2 },
  { name: 'Alpha', age: 1 },
];

describe('DataGrid', () => {
  it('renders rows and cells from columns/data (shorthand mode)', () => {
    render(<DataGrid columns={columns} data={data} />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Beta' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('defaults to plain/neutral/md/xBetween styling, matching Table', () => {
    render(<DataGrid columns={columns} data={data} data-testid="grid" />);
    expect(screen.getByTestId('grid')).toHaveClass('text-neutral-plain-color', 'bg-transparent');
  });

  it('toggles sorting asc -> desc -> none on header click, reordering rows', () => {
    render(<DataGrid columns={columns} data={data} />);
    const header = screen.getByRole('columnheader', { name: 'Name' });

    fireEvent.click(header);
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Alpha');

    fireEvent.click(header);
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Beta');

    fireEvent.click(header);
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Beta');
  });

  it('supports controlled sorting via sorting/onSortingChange', () => {
    function Controlled() {
      const [sorting, setSorting] = React.useState<SortingState>([]);
      return <DataGrid columns={columns} data={data} sorting={sorting} onSortingChange={setSorting} />;
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }));
    expect(screen.getAllByRole('cell')[0]).toHaveTextContent('Alpha');
  });

  it('resizing a column via the resize handle updates columnSizing', async () => {
    const onColumnSizingChange = vi.fn();

    function Controlled() {
      const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
      return (
        <DataGrid
          columns={columns}
          data={data}
          columnSizing={columnSizing}
          onColumnSizingChange={(updater) => {
            setColumnSizing((old) => {
              const next = typeof updater === 'function' ? updater(old) : updater;
              onColumnSizingChange(next);
              return next;
            });
          }}
        />
      );
    }
    render(<Controlled />);

    const handle = document.querySelector('th div') as HTMLElement;
    fireEvent.mouseDown(handle, { clientX: 0 });
    fireEvent.mouseMove(document, { clientX: 50 });
    // column-resizing's move handler batches via requestAnimationFrame.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // The clientX on mouseup matters: TanStack recomputes the final delta
    // from IT, not from the last mousemove — omitting it (or leaving it at
    // 0) silently resets the drag back to the starting size.
    fireEvent.mouseUp(document, { clientX: 50 });

    expect(onColumnSizingChange).toHaveBeenCalled();
    const lastCall = onColumnSizingChange.mock.calls.at(-1)?.[0] as ColumnSizingState;
    expect(lastCall.name).toBeGreaterThan(150);
  });

  it('compound mode (table + children) produces the same content as shorthand', () => {
    function Compound() {
      const { table } = useDataGrid<Person>({ columns, data });
      return (
        <DataGrid table={table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <DataGridRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <DataGridHeaderCell key={header.id} header={header} />
                ))}
              </DataGridRow>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <DataGridRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <DataGridCell key={cell.id} cell={cell} />
                ))}
              </DataGridRow>
            ))}
          </tbody>
        </DataGrid>
      );
    }
    render(<Compound />);
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Beta' })).toBeInTheDocument();
  });

  it('forwards a ref to the underlying table element', () => {
    const ref = React.createRef<HTMLTableElement>();
    render(<DataGrid ref={ref} columns={columns} data={data} />);
    expect(ref.current?.tagName).toBe('TABLE');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @hintoric/ui test -- DataGrid.test`
Expected: FAIL with "Cannot find module './DataGrid'".

- [ ] **Step 3: Write `DataGrid.tsx`**

```tsx
'use client';
import * as React from 'react';
import type { RowData } from '@tanstack/react-table';
import { cx } from '../../utils/cx';
import { STATIC_COLOR_CLASSES } from '../../utils/colorVariantClasses';
import { TABLE_SIZE_CLASS, TABLE_HEAD_CLASS, TABLE_BORDER_AXIS_CLASS } from './dataGridVariants';
import { DataGridContext } from './DataGridContext';
import { DataGridRow } from './DataGridRow';
import { DataGridHeaderCell } from './DataGridHeaderCell';
import { DataGridCell } from './DataGridCell';
import { useDataGrid } from './useDataGrid';
import type { DataGridCompoundProps, DataGridProps, DataGridShorthandProps, DataGridStyleProps, DataGridTable } from './types';

interface DataGridShellProps<TData extends RowData> extends DataGridStyleProps {
  table: DataGridTable<TData>;
  className?: string;
  children: React.ReactNode;
}

// Owns the actual <table> element and its <colgroup> — both render modes
// (shorthand and compound) funnel through this so the visual output and
// column-width wiring stay identical regardless of how the caller built the
// `table` instance.
const DataGridShell = React.forwardRef(function DataGridShell<TData extends RowData>(
  {
    table,
    variant = 'plain',
    color = 'neutral',
    size = 'md',
    borderAxis = 'xBetween',
    className,
    children,
  }: DataGridShellProps<TData>,
  ref: React.Ref<HTMLTableElement>,
) {
  return (
    <DataGridContext.Provider value={{ variant, color, size, borderAxis }}>
      <table
        ref={ref}
        className={cx(
          'w-full table-fixed rounded-md font-body [border-collapse:separate] [border-spacing:0]',
          TABLE_SIZE_CLASS[size],
          TABLE_HEAD_CLASS,
          TABLE_BORDER_AXIS_CLASS[borderAxis],
          STATIC_COLOR_CLASSES[variant][color],
          className,
        )}
      >
        {/* TanStack's recommended approach for resizable column widths under
            Tailwind's `table-fixed`: dynamic per-column pixel widths can't be
            expressed as utility classes, so they're set inline via <col>. */}
        <colgroup>
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: column.getSize() }} />
          ))}
        </colgroup>
        {children}
      </table>
    </DataGridContext.Provider>
  );
}) as <TData extends RowData>(props: DataGridShellProps<TData> & { ref?: React.Ref<HTMLTableElement> }) => React.ReactElement;

const DataGridShorthand = React.forwardRef(function DataGridShorthand<TData extends RowData>(
  {
    columns,
    data,
    enableSorting,
    enableColumnResizing,
    sorting,
    onSortingChange,
    columnSizing,
    onColumnSizingChange,
    variant,
    color,
    size,
    borderAxis,
    className,
    ...rest
  }: DataGridShorthandProps<TData>,
  ref: React.Ref<HTMLTableElement>,
) {
  const { table } = useDataGrid<TData>({
    columns,
    data,
    enableSorting,
    enableColumnResizing,
    sorting,
    onSortingChange,
    columnSizing,
    onColumnSizingChange,
  });

  return (
    <DataGridShell
      ref={ref}
      table={table}
      variant={variant}
      color={color}
      size={size}
      borderAxis={borderAxis}
      className={className}
      {...rest}
    >
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <DataGridRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <DataGridHeaderCell key={header.id} header={header} />
            ))}
          </DataGridRow>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <DataGridRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <DataGridCell key={cell.id} cell={cell} />
            ))}
          </DataGridRow>
        ))}
      </tbody>
    </DataGridShell>
  );
}) as <TData extends RowData>(props: DataGridShorthandProps<TData> & { ref?: React.Ref<HTMLTableElement> }) => React.ReactElement;

const DataGridCompound = React.forwardRef(function DataGridCompound<TData extends RowData>(
  { table, variant, color, size, borderAxis, className, children, ...rest }: DataGridCompoundProps<TData>,
  ref: React.Ref<HTMLTableElement>,
) {
  return (
    <DataGridShell
      ref={ref}
      table={table}
      variant={variant}
      color={color}
      size={size}
      borderAxis={borderAxis}
      className={className}
      {...rest}
    >
      {children}
    </DataGridShell>
  );
}) as <TData extends RowData>(props: DataGridCompoundProps<TData> & { ref?: React.Ref<HTMLTableElement> }) => React.ReactElement;

// `DataGrid` itself calls no hooks — it only decides which of the two
// (differently-hooked) child components to render. Calling `useDataGrid`
// conditionally INSIDE one component would violate the rules of hooks; two
// separate child component types sidesteps that entirely, since React just
// mounts a different component type per branch.
function DataGridInner<TData extends RowData>(props: DataGridProps<TData>, ref: React.Ref<HTMLTableElement>) {
  if ('table' in props && props.table) {
    return <DataGridCompound ref={ref} {...(props as DataGridCompoundProps<TData>)} />;
  }
  return <DataGridShorthand ref={ref} {...(props as DataGridShorthandProps<TData>)} />;
}

type DataGridComponentType = (<TData extends RowData>(
  props: DataGridProps<TData> & { ref?: React.Ref<HTMLTableElement> },
) => React.ReactElement) & { displayName?: string };

export const DataGrid = React.forwardRef(DataGridInner) as unknown as DataGridComponentType;
DataGrid.displayName = 'DataGrid';
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @hintoric/ui test -- DataGrid.test`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/DataGrid/DataGrid.tsx packages/ui/src/components/DataGrid/DataGrid.test.tsx
git commit -m "feat: add DataGrid root component with shorthand and compound rendering modes"
```

---

## Task 8: Barrel exports

**Files:**
- Create: `packages/ui/src/components/DataGrid/index.ts`
- Modify: `packages/ui/src/index.ts`

**Interfaces:**
- Consumes: everything from Tasks 2-7.
- Produces: `DataGrid`, `DataGridRow`, `DataGridHeaderCell`, `DataGridCell`, `useDataGrid`, and their associated types, importable from `@hintoric/ui`.

- [ ] **Step 1: Write `components/DataGrid/index.ts`**

```ts
export { DataGrid } from './DataGrid';
export { DataGridRow } from './DataGridRow';
export { DataGridHeaderCell } from './DataGridHeaderCell';
export { DataGridCell } from './DataGridCell';
export { useDataGrid } from './useDataGrid';
export type {
  DataGridProps,
  DataGridShorthandProps,
  DataGridCompoundProps,
  DataGridStyleProps,
  DataGridRowProps,
  DataGridHeaderCellProps,
  DataGridCellProps,
  UseDataGridOptions,
  UseDataGridResult,
  DataGridColumnDef,
  DataGridTable,
  DataGridHeader,
  DataGridRowInstance,
  DataGridCellInstance,
  DataGridColumn,
} from './types';
```

- [ ] **Step 2: Append to `packages/ui/src/index.ts`**

Add after the existing `Table` export block (`export { Table } from './components/Table'; export type { TableProps, TableBorderAxis } from './components/Table';`):

```ts
export { DataGrid, DataGridRow, DataGridHeaderCell, DataGridCell, useDataGrid } from './components/DataGrid';
export type {
  DataGridProps,
  DataGridShorthandProps,
  DataGridCompoundProps,
  DataGridStyleProps,
  DataGridRowProps,
  DataGridHeaderCellProps,
  DataGridCellProps,
  UseDataGridOptions,
  UseDataGridResult,
  DataGridColumnDef,
  DataGridTable,
  DataGridHeader,
  DataGridRowInstance,
  DataGridCellInstance,
  DataGridColumn,
} from './components/DataGrid';
```

- [ ] **Step 3: Verify the full unit test suite still passes**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS (all existing tests plus every DataGrid test from Tasks 2-7).

- [ ] **Step 4: Verify typecheck passes**

Run from the repo root: `pnpm typecheck`
Expected: no errors. This is the first point where the generic `forwardRef` casts in `DataGrid.tsx`/`DataGridHeaderCell.tsx`/`DataGridCell.tsx` are checked against the library's actual `tsconfig` (strict mode, `rollupTypes: true` for the `.d.ts` bundle) rather than the ad-hoc `tsc` invocation used during design verification — if anything differs, fix it here before moving on.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/components/DataGrid/index.ts packages/ui/src/index.ts
git commit -m "feat: export DataGrid family from the package's public API"
```

---

## Task 9: Visual regression (self-baseline, per the spec's documented exception)

**Files:**
- Create: `packages/ui/src/visual/DataGrid.visual.test.tsx`

**Interfaces:**
- Consumes: `DataGrid`, `DataGridColumnDef` from `@hintoric/ui`'s source (`../components/DataGrid`, matching how other visual tests import from `../components/X` rather than the built package).
- Produces: committed baseline screenshots under `src/visual/__screenshots__/DataGrid.visual.test.tsx/`.

Per the spec's Section 2 (approved exception to `CLAUDE.md`'s Joy-comparison rule): no `@mui/joy` element, no `getComputedStyle()`-equality assertions against a reference. `toMatchScreenshot()` is the only pass/fail signal here, run against DataGrid's own prior screenshots.

- [ ] **Step 1: Write the test file**

```tsx
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import * as React from 'react';
import { DataGrid } from '../components/DataGrid';
import type { DataGridColumnDef } from '../components/DataGrid';

// DataGrid is exempt from this suite's usual "compare against real @mui/joy"
// rule (see docs/superpowers/specs/2026-09-03-datagrid-phase-1-design.md,
// Section 2): Joy UI has no DataGrid equivalent to compare against. These
// are self-baseline screenshots only — toMatchScreenshot() against DataGrid's
// own prior screenshots, for humans to review, same mechanism as every other
// visual test in this file but without a Joy side-by-side.

const VARIANTS = ['solid', 'soft', 'outlined', 'plain'] as const;
const COLORS = ['primary', 'neutral', 'danger', 'success', 'warning'] as const;
const BORDER_AXES = ['none', 'x', 'xBetween', 'y', 'yBetween', 'both', 'bothBetween'] as const;

interface Person {
  name: string;
  age: number;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 150 },
  { accessorKey: 'age', header: 'Age', size: 100 },
];

const data: Person[] = [
  { name: 'Beta', age: 2 },
  { name: 'Alpha', age: 1 },
];

describe('DataGrid visual (self-baseline)', () => {
  for (const variant of VARIANTS) {
    for (const color of COLORS) {
      it(`${variant}/${color} matches its own baseline screenshot`, async () => {
        render(<DataGrid columns={columns} data={data} variant={variant} color={color} data-testid={`grid-${variant}-${color}`} />);
        await expect(page.getByTestId(`grid-${variant}-${color}`)).toMatchScreenshot(`datagrid-${variant}-${color}`);
      });
    }
  }

  for (const borderAxis of BORDER_AXES) {
    it(`borderAxis=${borderAxis} matches its own baseline screenshot`, async () => {
      render(<DataGrid columns={columns} data={data} borderAxis={borderAxis} data-testid={`grid-border-${borderAxis}`} />);
      await expect(page.getByTestId(`grid-border-${borderAxis}`)).toMatchScreenshot(`datagrid-border-${borderAxis}`);
    });
  }

  it('a sorted column shows its sort indicator and matches its own baseline', async () => {
    render(<DataGrid columns={columns} data={data} sorting={[{ id: 'name', desc: false }]} data-testid="grid-sorted" />);
    await expect(page.getByTestId('grid-sorted')).toMatchScreenshot('datagrid-sorted-asc');
  });

  it('the resize handle is present and hidden until hover (opacity-0 class)', () => {
    render(<DataGrid columns={columns} data={data} data-testid="grid-resize" />);
    const handle = page.getByTestId('grid-resize').element().querySelector('th div');
    expect(handle).not.toBeNull();
    expect(handle?.className).toContain('opacity-0');
    expect(handle?.className).toContain('group-hover:opacity-100');
  });
});
```

- [ ] **Step 2: Run once to create baselines (expected to "fail" on purpose)**

Run: `pnpm --filter @hintoric/ui test:visual -- DataGrid`
Expected: fails with "no existing reference screenshot found" messages — this is the documented first-run behavior for every visual test in this repo, not a bug.

- [ ] **Step 3: Run again to confirm baselines now pass**

Run: `pnpm --filter @hintoric/ui test:visual -- DataGrid`
Expected: PASS. If it still shows baseline-creation messages, run once more (documented environmental quirk — takes 2-3 runs to settle in this repo).

- [ ] **Step 4: Open the new screenshots and look at them**

Open the PNGs under `packages/ui/src/visual/__screenshots__/DataGrid.visual.test.tsx/` and visually confirm: the grid looks like a `Table` with the given variant/color, the sort indicator renders next to "Name" in the sorted screenshot, and border axes visually differ across the `BORDER_AXES` screenshots the way `Table`'s own equivalent screenshots do.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/visual/DataGrid.visual.test.tsx packages/ui/src/visual/__screenshots__/DataGrid.visual.test.tsx/
git commit -m "test: add DataGrid self-baseline visual regression coverage"
```

---

## Task 10: Roadmap page

**Files:**
- Modify: `apps/docs/src/pages/RoadmapPage.tsx`

**Interfaces:**
- Consumes: nothing (documentation-only change).
- Produces: an updated roadmap entry.

- [ ] **Step 1: Add a `DataGrid` entry**

In the `'Data display'` group's `items` array (next to the existing `Table` entry), add:

```ts
{ name: 'DataGrid (Phase 1: sort + resize)', done: true },
```

- [ ] **Step 2: Verify the docs app still builds**

Run: `pnpm --filter docs build` (or the docs app's equivalent build script — check `apps/docs/package.json` for the exact script name if `build` doesn't match).
Expected: builds without errors.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/pages/RoadmapPage.tsx
git commit -m "docs: mark DataGrid Phase 1 as done on the roadmap"
```

---

## Task 11: Final full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full jsdom unit test suite**

Run: `pnpm --filter @hintoric/ui test`
Expected: PASS, including every test from Tasks 2-7.

- [ ] **Step 2: Run the full visual regression suite**

Run: `pnpm --filter @hintoric/ui test:visual`
Expected: PASS (no regressions in any other component's baselines from the new dependency/exports).

- [ ] **Step 3: Run typecheck**

Run from the repo root: `pnpm typecheck`
Expected: no errors (this also rebuilds the library first, per this repo's typecheck script, so it doubles as a build sanity check for the `dts({ rollupTypes: true })` step against DataGrid's generic types).

- [ ] **Step 4: Run lint**

Run from the repo root: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Run the library build**

Run: `pnpm --filter @hintoric/ui build`
Expected: builds `dist/index.js` + `dist/style.css` without errors.

- [ ] **Step 6: Manual smoke check in the playground app (if present)**

If `apps/playground` exists and has a page for trying components, add a temporary `<DataGrid columns={...} data={...} />` usage, start the dev server, and confirm in a browser that: columns sort on header click, dragging a column's right edge resizes it live, and the grid's default styling matches a `<Table>` with the same props. Remove the temporary usage afterward unless the user asks to keep it as a permanent playground example.
