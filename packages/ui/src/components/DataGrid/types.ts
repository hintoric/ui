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
