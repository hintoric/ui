import { describe, expect, it } from 'vitest';
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
