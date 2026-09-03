'use client';
import * as React from 'react';
import { flexRender } from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import { cx } from '../../utils/cx';
import { ArrowDropDownIcon } from '../../internal/svg-icons/ArrowDropDownIcon';
import { useDataGridContext } from './DataGridContext';
import { DATAGRID_HEADER_HOVER_CLASS, DATAGRID_RESIZE_HANDLE_CLASS, DATAGRID_SORT_ICON_CLASS } from './dataGridVariants';
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
        canSort && cx('cursor-pointer select-none', DATAGRID_HEADER_HOVER_CLASS[variant][color]),
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
