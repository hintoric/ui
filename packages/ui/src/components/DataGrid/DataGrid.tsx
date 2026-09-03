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

interface DataGridShellProps<TData extends RowData>
  extends DataGridStyleProps,
    Omit<React.ComponentPropsWithoutRef<'table'>, 'color' | 'children' | 'className'> {
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
    ...rest
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
        {...rest}
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
