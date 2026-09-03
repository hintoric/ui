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
