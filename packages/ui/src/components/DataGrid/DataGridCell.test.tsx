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
