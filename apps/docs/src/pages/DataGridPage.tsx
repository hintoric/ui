import { DataGrid } from '@hintoric/ui';
import type { DataGridColumnDef } from '@hintoric/ui';
import { Demo, Code } from '../components/Demo';
import { PropsTable } from '../components/PropsTable';

interface Person {
  name: string;
  age: number;
  role: string;
}

const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 160 },
  { accessorKey: 'age', header: 'Age', size: 100 },
  { accessorKey: 'role', header: 'Role', size: 220 },
];

const data: Person[] = [
  { name: 'Ada Lovelace', age: 36, role: 'Mathematician' },
  { name: 'Grace Hopper', age: 85, role: 'Rear Admiral' },
  { name: 'Alan Turing', age: 41, role: 'Cryptanalyst' },
  { name: 'Katherine Johnson', age: 101, role: 'Physicist' },
];

export function DataGridPage() {
  return (
    <>
      <h1>DataGrid</h1>
      <p className="docs-lede">
        A sortable, resizable data table built on{' '}
        <a href="https://tanstack.com/table" target="_blank" rel="noreferrer">
          TanStack Table
        </a>
        &apos;s headless row-model logic, styled to match <code>Table</code>. This is Phase 1
        (Foundation) of a planned multi-phase build toward a full spreadsheet-like grid — see the{' '}
        <a href="/roadmap">Roadmap</a> for what&apos;s planned next (cell selection, inline editing,
        virtualization).
      </p>

      <h2>Basic usage</h2>
      <p>
        Click a column header to sort by it (click again to reverse, a third time to clear). Drag
        the right edge of a header to resize that column.
      </p>
      <Demo>
        <DataGrid columns={columns} data={data} />
      </Demo>
      <Code>{`const columns: DataGridColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', size: 160 },
  { accessorKey: 'age', header: 'Age', size: 100 },
  { accessorKey: 'role', header: 'Role', size: 220 },
];

<DataGrid columns={columns} data={data} />`}</Code>

      <h2>Variants &amp; colors</h2>
      <p>
        <code>DataGrid</code> accepts the same <code>variant</code>/<code>color</code>/
        <code>size</code>/<code>borderAxis</code> props as <code>Table</code> and looks identical
        for the same values.
      </p>
      <Demo>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DataGrid columns={columns} data={data} variant="solid" color="primary" size="sm" />
          <DataGrid columns={columns} data={data} variant="outlined" color="danger" borderAxis="both" />
        </div>
      </Demo>
      <Code>{`<DataGrid columns={columns} data={data} variant="outlined" color="danger" borderAxis="both" />`}</Code>

      <h2>Compound mode</h2>
      <p>
        For custom header/cell layouts, call <code>useDataGrid</code> directly and build the
        markup from <code>DataGridRow</code>/<code>DataGridHeaderCell</code>/<code>DataGridCell</code>{' '}
        yourself — the same subcomponents the shorthand form above uses internally.
      </p>
      <Code>{`const { table } = useDataGrid<Person>({ columns, data });

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
</DataGrid>`}</Code>

      <h2>Props</h2>
      <PropsTable
        rows={[
          { name: 'columns', type: 'DataGridColumnDef<TData>[]', description: 'TanStack Table column definitions. Required in shorthand mode.' },
          { name: 'data', type: 'TData[]', description: 'Row data. Required in shorthand mode.' },
          { name: 'table', type: 'DataGridTable<TData>', description: 'A table instance from useDataGrid(). Required in compound mode (with children).' },
          { name: 'variant', type: "'solid' | 'soft' | 'outlined' | 'plain'", default: "'plain'", description: 'Visual style, same as Table.' },
          { name: 'color', type: "'primary' | 'neutral' | 'danger' | 'success' | 'warning'", default: "'neutral'", description: 'Color palette, same as Table.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls row height, padding and font size, same as Table.' },
          { name: 'borderAxis', type: "'none' | 'x' | 'xBetween' | 'y' | 'yBetween' | 'both' | 'bothBetween'", default: "'xBetween'", description: 'Which borders are drawn, same as Table.' },
          { name: 'enableSorting', type: 'boolean', default: 'true', description: 'Enables column sorting on click for the whole grid.' },
          { name: 'enableColumnResizing', type: 'boolean', default: 'true', description: 'Enables the drag-to-resize handle on sortable/resizable columns.' },
          { name: 'sorting', type: 'SortingState', description: 'Controlled sorting state. Pair with onSortingChange; omit both for uncontrolled sorting.' },
          { name: 'onSortingChange', type: 'OnChangeFn<SortingState>', description: 'Called when sorting changes (controlled mode).' },
          { name: 'columnSizing', type: 'ColumnSizingState', description: 'Controlled column widths. Pair with onColumnSizingChange; omit both for uncontrolled resizing.' },
          { name: 'onColumnSizingChange', type: 'OnChangeFn<ColumnSizingState>', description: 'Called when a column is resized (controlled mode).' },
        ]}
      />
    </>
  );
}
