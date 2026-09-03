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
