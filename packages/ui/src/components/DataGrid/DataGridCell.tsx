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
