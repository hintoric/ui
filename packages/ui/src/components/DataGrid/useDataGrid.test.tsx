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
      sorting = typeof updater === 'function' ? (updater as (old: typeof sorting) => typeof sorting)(sorting) : (updater as typeof sorting);
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
